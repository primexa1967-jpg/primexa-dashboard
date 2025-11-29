from typing import Dict

def sample_dashboard_payload() -> Dict:
    return {
        'mood': {'bull': 45, 'bear': 35, 'neutral': 20},
        'index': {
            'name': 'NIFTY',
            'spot': 22500.5,
            'trend_arrow': 'UP'
        },
        'ladder': [
            {
                'strike': 22500,
                'ce': {
                    'ltp': 110.5,
                    'ltp_chg': -3.2,
                    'oi': 250000,
                    'oi_chg_pct': 4.5,
                    'builtup': 'SC'
                },
                'pe': {
                    'ltp': 135.2,
                    'ltp_chg': 5.1,
                    'oi': 280000,
                    'oi_chg_pct': 7.8,
                    'builtup': 'LB'
                },
                'pcr': 1.12
            }
        ]
    }
