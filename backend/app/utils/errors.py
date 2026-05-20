from typing import Any


def make_error(code: str, message: str, details: list[Any] | None = None):
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details or [],
        }
    }
