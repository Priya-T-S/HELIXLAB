"""Validator component for checking nucleotide sequences against the IUPAC alphabet."""

from dataclasses import dataclass, field


@dataclass
class ValidationResult:
    is_valid: bool
    normalized_sequence: str
    invalid_characters: list[str] = field(default_factory=list)
    error_message: str | None = None


class Validator:
    IUPAC_ALPHABET: frozenset[str] = frozenset("ATGCNRYSWKMBDHV")

    def validate(self, raw_input: str) -> ValidationResult:
        stripped = raw_input.strip()

        if not stripped:
            return ValidationResult(
                is_valid=False,
                normalized_sequence="",
                invalid_characters=[],
                error_message="Please provide a non-empty sequence.",
            )

        uppercased = stripped.upper()

        invalid_chars = sorted({ch for ch in uppercased if ch not in self.IUPAC_ALPHABET})

        if invalid_chars:
            chars = ", ".join(invalid_chars)
            return ValidationResult(
                is_valid=False,
                normalized_sequence=uppercased,
                invalid_characters=invalid_chars,
                error_message=(
                    f"Invalid characters found: {chars}. "
                    "Only IUPAC nucleotide characters are accepted."
                ),
            )

        return ValidationResult(
            is_valid=True,
            normalized_sequence=uppercased,
            invalid_characters=[],
            error_message=None,
        )
