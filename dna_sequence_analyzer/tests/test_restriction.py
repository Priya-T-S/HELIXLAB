"""Tests for restriction enzyme finder component."""

import pytest

from dna_sequence_analyzer.components.restriction import (
    find_restriction_sites,
    get_enzyme_info,
    ENZYMES,
)


class TestFindRestrictionSites:
    def test_single_site_found(self):
        """Test finding a single restriction site."""
        sequence = "GAATTC"
        sites = find_restriction_sites(sequence)
        assert "EcoRI" in sites
        assert sites["EcoRI"] == [1]

    def test_multiple_sites_same_enzyme(self):
        """Test finding multiple sites for the same enzyme."""
        sequence = "GAATTCNNNNNGAATTC"
        sites = find_restriction_sites(sequence)
        assert "EcoRI" in sites
        assert sites["EcoRI"] == [1, 12]

    def test_multiple_enzymes(self):
        """Test finding sites for multiple enzymes."""
        sequence = "GAATTCGGATCC"
        sites = find_restriction_sites(sequence)
        assert "EcoRI" in sites
        assert "BamHI" in sites
        assert sites["EcoRI"] == [1]
        assert sites["BamHI"] == [7]

    def test_no_sites_found(self):
        """Test sequence with no restriction sites."""
        sequence = "AAAAAAAAAA"
        sites = find_restriction_sites(sequence)
        assert len(sites) == 0

    def test_overlapping_sites(self):
        """Test overlapping restriction sites."""
        # HindIII: AAGCTT, create overlapping pattern
        sequence = "AAGCTTAAGCTT"
        sites = find_restriction_sites(sequence)
        assert "HindIII" in sites
        assert sites["HindIII"] == [1, 7]

    def test_positions_are_1_based(self):
        """Verify positions are 1-based."""
        sequence = "NNNGAATTC"
        sites = find_restriction_sites(sequence)
        assert sites["EcoRI"] == [4]  # Not [3]

    def test_empty_sequence(self):
        """Test with empty sequence."""
        sites = find_restriction_sites("")
        assert len(sites) == 0

    def test_short_sequence(self):
        """Test with sequence shorter than any enzyme."""
        sites = find_restriction_sites("AT")
        assert len(sites) == 0


class TestGetEnzymeInfo:
    def test_valid_enzyme(self):
        """Test getting info for a valid enzyme."""
        info = get_enzyme_info("EcoRI")
        assert info["name"] == "EcoRI"
        assert info["recognition_sequence"] == "GAATTC"
        assert info["length"] == 6

    def test_invalid_enzyme(self):
        """Test getting info for non-existent enzyme."""
        info = get_enzyme_info("FakeEnzyme")
        assert info == {}

    def test_all_enzymes_have_info(self):
        """Verify all defined enzymes can be looked up."""
        for enzyme_name in ENZYMES.keys():
            info = get_enzyme_info(enzyme_name)
            assert info["name"] == enzyme_name
            assert len(info["recognition_sequence"]) > 0
