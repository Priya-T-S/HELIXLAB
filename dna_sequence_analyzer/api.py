"""Flask API for DNA Sequence Analyzer."""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dna_sequence_analyzer.components.validator import Validator
from dna_sequence_analyzer.components.parser import Parser, SequenceRecord
from dna_sequence_analyzer.components.analyzer import Analyzer

app = Flask(__name__)
CORS(app)

validator = Validator()
parser = Parser()
analyzer = Analyzer()


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Analyze DNA sequence."""
    try:
        data = request.json
        sequence_input = data.get('sequence', '')
        input_type = data.get('type', 'raw')

        if not sequence_input or not sequence_input.strip():
            return jsonify({'error': 'Please provide a sequence'}), 400

        results = []

        if input_type == 'raw':
            # Validate raw sequence
            result = validator.validate(sequence_input)
            if not result.is_valid:
                return jsonify({'error': result.error_message}), 400

            record = SequenceRecord(header='pasted_sequence', sequence=result.normalized_sequence)
            analysis = analyzer.analyze(record)
            results.append(_format_result(analysis))

        else:  # fasta
            # Parse FASTA
            parse_result = parser.parse_fasta(sequence_input)
            if parse_result.error:
                return jsonify({'error': parse_result.error}), 400

            if parse_result.warnings:
                # Log warnings but continue
                pass

            for record in parse_result.records:
                analysis = analyzer.analyze(record)
                results.append(_format_result(analysis))

        return jsonify({'results': results}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def _format_result(analysis):
    """Format analysis result for JSON response."""
    return {
        'header': analysis.record.header,
        'sequence': analysis.record.sequence,
        'stats': {
            'length': analysis.stats.length,
            'a_count': analysis.stats.a_count,
            't_count': analysis.stats.t_count,
            'g_count': analysis.stats.g_count,
            'c_count': analysis.stats.c_count,
            'ambiguous_count': analysis.stats.ambiguous_count,
            'gc_content': analysis.stats.gc_content,
            'at_content': analysis.stats.at_content,
        },
        'reverse_complement': analysis.reverse_complement,
        'translations': analysis.translations,
        'orfs': {
            frame: [
                {
                    'frame': orf.frame,
                    'start': orf.start,
                    'end': orf.end,
                    'length_nt': orf.length_nt,
                    'amino_acid_sequence': orf.amino_acid_sequence,
                }
                for orf in orfs_list
            ] if orfs_list else []
            for frame, orfs_list in analysis.all_orfs.items()
        },
    }


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok'}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)
