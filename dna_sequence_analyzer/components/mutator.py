"""Mutation simulator component for introducing mutations into DNA sequences."""

from dna_sequence_analyzer.components.validator import Validator


class MutationError(Exception):
    """Raised when a mutation operation fails validation."""
    pass


class Mutator:
    """Handles DNA sequence mutations (substitution, insertion, deletion)."""
    
    def __init__(self):
        self._validator = Validator()
    
    def mutate_substitution(self, sequence: str, position: int, new_base: str) -> str:
        """Replace a base at the given position with a new base.
        
        Args:
            sequence: Uppercase DNA sequence
            position: 1-based position to mutate
            new_base: Single IUPAC nucleotide character
            
        Returns:
            Mutated sequence
            
        Raises:
            MutationError: If position is out of bounds or new_base is invalid
        """
        if position < 1 or position > len(sequence):
            raise MutationError(f"Position {position} out of bounds (1-{len(sequence)})")
        
        new_base_upper = new_base.upper()
        result = self._validator.validate(new_base_upper)
        if not result.is_valid:
            raise MutationError(f"Invalid base '{new_base}': {result.error_message}")
        
        idx = position - 1  # Convert to 0-based
        return sequence[:idx] + new_base_upper + sequence[idx + 1:]
    
    def mutate_insertion(self, sequence: str, position: int, base: str) -> str:
        """Insert a base at the given position.
        
        Args:
            sequence: Uppercase DNA sequence
            position: 1-based position (insert before this position; position=1 inserts at start)
            base: Single IUPAC nucleotide character
            
        Returns:
            Mutated sequence with base inserted
            
        Raises:
            MutationError: If position is out of bounds or base is invalid
        """
        if position < 1 or position > len(sequence) + 1:
            raise MutationError(f"Position {position} out of bounds (1-{len(sequence) + 1})")
        
        base_upper = base.upper()
        result = self._validator.validate(base_upper)
        if not result.is_valid:
            raise MutationError(f"Invalid base '{base}': {result.error_message}")
        
        idx = position - 1  # Convert to 0-based
        return sequence[:idx] + base_upper + sequence[idx:]
    
    def mutate_deletion(self, sequence: str, position: int) -> str:
        """Delete a base at the given position.
        
        Args:
            sequence: Uppercase DNA sequence
            position: 1-based position to delete
            
        Returns:
            Mutated sequence with base removed
            
        Raises:
            MutationError: If position is out of bounds
        """
        if position < 1 or position > len(sequence):
            raise MutationError(f"Position {position} out of bounds (1-{len(sequence)})")
        
        idx = position - 1  # Convert to 0-based
        return sequence[:idx] + sequence[idx + 1:]
