"""Restriction enzyme finder component for identifying cut sites in DNA sequences."""

ENZYMES = {
    "EcoRI": "GAATTC",
    "BamHI": "GGATCC",
    "HindIII": "AAGCTT",
    "NotI": "GCGGCCGC",
    "PstI": "CTGCAG",
    "SalI": "GTCGAC",
    "XbaI": "TCTAGA",
    "SmaI": "CCCGGG",
    "KpnI": "GGTACC",
    "SphI": "GCATGC",
}


def find_restriction_sites(sequence: str) -> dict:
    """Find all restriction enzyme cut sites in a DNA sequence.
    
    Args:
        sequence: Uppercase, validated DNA sequence
        
    Returns:
        Dictionary mapping enzyme names to lists of 1-based positions where they cut.
        Example: {"EcoRI": [12, 45], "BamHI": [30]}
    """
    sites = {}
    
    for enzyme_name, recognition_seq in ENZYMES.items():
        positions = []
        seq_len = len(recognition_seq)
        
        # Search for all occurrences (1-based positions)
        for i in range(len(sequence) - seq_len + 1):
            if sequence[i:i + seq_len] == recognition_seq:
                positions.append(i + 1)  # Convert to 1-based
        
        if positions:
            sites[enzyme_name] = positions
    
    return sites


def get_enzyme_info(enzyme_name: str) -> dict:
    """Get information about a specific restriction enzyme.
    
    Args:
        enzyme_name: Name of the enzyme (e.g., "EcoRI")
        
    Returns:
        Dictionary with enzyme info or empty dict if not found.
    """
    if enzyme_name in ENZYMES:
        return {
            "name": enzyme_name,
            "recognition_sequence": ENZYMES[enzyme_name],
            "length": len(ENZYMES[enzyme_name]),
        }
    return {}
