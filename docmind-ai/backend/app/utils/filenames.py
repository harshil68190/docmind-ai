"""
Filename sanitization.

Every uploaded file already lives in a per-document UUID folder
(`storage/uploads/{user_id}/{document_id}/`), so a collision between two
different documents' filenames is structurally impossible regardless of
what this function returns. What it protects against instead is a
malicious or malformed `original_filename` (e.g. `"../../etc/passwd"`,
a name containing null bytes, or an absurdly long name) ever being used
as a literal filesystem path.
"""
import re
import uuid

_UNSAFE_CHARS_RE = re.compile(r"[^A-Za-z0-9._-]")
_MAX_LENGTH = 200


def generate_safe_filename(original_filename: str) -> str:
    # Strip any directory components from either OS's path separator —
    # this is what actually neutralizes "../" traversal attempts.
    basename = original_filename.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
    sanitized = _UNSAFE_CHARS_RE.sub("_", basename).strip("._")

    if not sanitized:
        sanitized = f"file_{uuid.uuid4().hex[:8]}"

    return sanitized[:_MAX_LENGTH]
