"""Temporal edge mechanics compatibility module.

The canonical temporal gate-crossing implementation lives in temporal_ephemeris.
This module remains as the stable downstream import surface.
"""
from temporal_ephemeris import find_gate_crossings

__all__ = ["find_gate_crossings"]
