"""Tests for mutation simulator component."""

import pytest

from dna_sequence_analyzer.components.mutator import Mutator, MutationError


@pytest.fixture
def mutator():
    return Mutator()


class TestSubstitution:
    def test_valid_substitution(self, mutator):
        """Test valid base substitution."""
        result = mutator.mutate_substitution("ATGC", 1, "G")
        assert result == "GTGC"

    def test_substitution_middle(self, mutator):
        """Test substitution in middle of sequence."""
        result = mutator.mutate_substitution("ATGC", 2, "C")
        assert result == "ACGC"

    def test_substitution_end(self, mutator):
        """Test substitution at end of sequence."""
        result = mutator.mutate_substitution("ATGC", 4, "A")
        assert result == "ATGA"

    def test_substitution_lowercase_input(self, mutator):
        """Test that lowercase input is normalized."""
        result = mutator.mutate_substitution("ATGC", 1, "g")
        assert result == "GTGC"

    def test_substitution_position_out_of_bounds_low(self, mutator):
        """Test substitution with position < 1."""
        with pytest.raises(MutationError):
            mutator.mutate_substitution("ATGC", 0, "G")

    def test_substitution_position_out_of_bounds_high(self, mutator):
        """Test substitution with position > length."""
        with pytest.raises(MutationError):
            mutator.mutate_substitution("ATGC", 5, "G")

    def test_substitution_invalid_base(self, mutator):
        """Test substitution with invalid base."""
        with pytest.raises(MutationError):
            mutator.mutate_substitution("ATGC", 1, "X")


class TestInsertion:
    def test_valid_insertion_start(self, mutator):
        """Test insertion at start of sequence."""
        result = mutator.mutate_insertion("ATGC", 1, "G")
        assert result == "GATGC"

    def test_valid_insertion_middle(self, mutator):
        """Test insertion in middle of sequence."""
        result = mutator.mutate_insertion("ATGC", 2, "C")
        assert result == "ACTGC"

    def test_valid_insertion_end(self, mutator):
        """Test insertion at end of sequence."""
        result = mutator.mutate_insertion("ATGC", 5, "A")
        assert result == "ATGCA"

    def test_insertion_lowercase_input(self, mutator):
        """Test that lowercase input is normalized."""
        result = mutator.mutate_insertion("ATGC", 1, "g")
        assert result == "GATGC"

    def test_insertion_position_out_of_bounds_low(self, mutator):
        """Test insertion with position < 1."""
        with pytest.raises(MutationError):
            mutator.mutate_insertion("ATGC", 0, "G")

    def test_insertion_position_out_of_bounds_high(self, mutator):
        """Test insertion with position > length + 1."""
        with pytest.raises(MutationError):
            mutator.mutate_insertion("ATGC", 6, "G")

    def test_insertion_invalid_base(self, mutator):
        """Test insertion with invalid base."""
        with pytest.raises(MutationError):
            mutator.mutate_insertion("ATGC", 1, "Z")


class TestDeletion:
    def test_valid_deletion_start(self, mutator):
        """Test deletion at start of sequence."""
        result = mutator.mutate_deletion("ATGC", 1)
        assert result == "TGC"

    def test_valid_deletion_middle(self, mutator):
        """Test deletion in middle of sequence."""
        result = mutator.mutate_deletion("ATGC", 2)
        assert result == "AGC"

    def test_valid_deletion_end(self, mutator):
        """Test deletion at end of sequence."""
        result = mutator.mutate_deletion("ATGC", 4)
        assert result == "ATG"

    def test_deletion_position_out_of_bounds_low(self, mutator):
        """Test deletion with position < 1."""
        with pytest.raises(MutationError):
            mutator.mutate_deletion("ATGC", 0)

    def test_deletion_position_out_of_bounds_high(self, mutator):
        """Test deletion with position > length."""
        with pytest.raises(MutationError):
            mutator.mutate_deletion("ATGC", 5)

    def test_deletion_single_base_sequence(self, mutator):
        """Test deletion on single-base sequence."""
        result = mutator.mutate_deletion("A", 1)
        assert result == ""


class TestMutationChaining:
    def test_multiple_mutations(self, mutator):
        """Test applying multiple mutations sequentially."""
        seq = "ATGC"
        seq = mutator.mutate_substitution(seq, 1, "G")  # GTGC
        seq = mutator.mutate_insertion(seq, 2, "A")     # GAGTGC
        seq = mutator.mutate_deletion(seq, 3)           # GAGC
        assert seq == "GAGC"
