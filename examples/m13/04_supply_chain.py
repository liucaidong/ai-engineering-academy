#!/usr/bin/env python3
"""Create a deterministic file manifest and enforce a Skill package root."""
from __future__ import annotations
import argparse
import hashlib
from pathlib import Path

def safe_file(root: Path, relative_path: str) -> Path:
    """Demonstrate package-root checks; not race-safe under concurrent mutation."""
    base = root.resolve(strict=True)
    relative = Path(relative_path)
    if relative.is_absolute() or ".." in relative.parts:
        raise ValueError("path_escape")
    candidate = root / relative
    current = root
    for part in relative.parts:
        if part in {"", "."}:
            continue
        current = current / part
        if current.is_symlink():
            raise ValueError("symlink_not_allowed")
    resolved = candidate.resolve(strict=True)
    try:
        resolved.relative_to(base)
    except ValueError as exc:
        raise ValueError("path_escape") from exc
    if not resolved.is_file():
        raise ValueError("not_a_regular_file")
    return resolved

def manifest(root: Path, relative_paths: list[str]) -> list[dict[str, str]]:
    records = []
    for relative in sorted(relative_paths):
        path = safe_file(root, relative)
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        records.append({"path": relative, "sha256": digest})
    return records

def capability_policy(requested: set[str], approved: set[str]) -> set[str]:
    denied = requested - approved
    if denied:
        raise PermissionError(f"unapproved capabilities: {sorted(denied)}")
    return requested

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("skill_dir", nargs="?", default=str(Path(__file__).parent / "repository-security-review"))
    args = parser.parse_args()
    root = Path(args.skill_dir)
    paths = [
        str(path.relative_to(root))
        for path in root.rglob("*")
        if path.is_file()
        and not path.is_symlink()
        and "__pycache__" not in path.parts
        and path.suffix != ".pyc"
        and path.name != ".DS_Store"
    ]
    print("manifest:", manifest(root, paths))
    print("No network, write or subprocess capability is granted by default.")

if __name__ == "__main__":
    main()
