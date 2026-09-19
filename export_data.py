"""Export this project's synthetic JSON data as CSV tables (Python standard library)."""
import argparse
import csv
import json
from pathlib import Path

DEFAULT_DATA = "data.json"

def export_tables(source, destination):
    payload = json.loads(source.read_text(encoding="utf-8"))
    if isinstance(payload, list):
        tables = {"records": payload}
    elif isinstance(payload, dict):
        tables = {key: value for key, value in payload.items() if isinstance(value, list)}
        assumptions = [{"parameter": key, "value": value} for key, value in payload.items()
                       if not isinstance(value, list)]
        if assumptions:
            tables["assumptions"] = assumptions
    else:
        raise ValueError("Expected a JSON list of records or an object containing tables.")
    for name, rows in tables.items():
        if not isinstance(rows, list) or not all(isinstance(row, dict) for row in rows):
            raise ValueError(f"{name}: expected a list of objects.")
    destination.mkdir(parents=True, exist_ok=True)
    for index, (name, rows) in enumerate(tables.items(), start=1):
        # Numbered filenames prevent JSON keys from becoming filesystem paths.
        target = destination / f"table_{index}.csv"
        columns = list(dict.fromkeys(key for row in rows for key in row))
        with target.open("w", newline="", encoding="utf-8-sig") as handle:
            writer = csv.DictWriter(handle, fieldnames=columns)
            writer.writeheader()
            for row in rows:
                writer.writerow({key: json.dumps(value) if isinstance(value, (list, dict))
                                 else value for key, value in row.items()})
        print(f"{name}: {len(rows)} rows -> {target}")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=Path(__file__).parent / DEFAULT_DATA,
                        help="JSON input; defaults to this project's bundled synthetic data.")
    parser.add_argument("--output", type=Path, default=Path("exports"),
                        help="Output directory. Existing table CSV files will be replaced.")
    args = parser.parse_args()
    try:
        export_tables(args.input, args.output)
    except (OSError, ValueError) as error:
        parser.exit(1, f"Export failed: {error}\n")

if __name__ == "__main__":
    main()
