import pytest
from ephemeris import gate_line, GATE_SIZE_DEG, LINE_SIZE_DEG, GATE_ORDER

def test_gate_boundaries():
    for i, gate in enumerate(GATE_ORDER):
        start = i * GATE_SIZE_DEG
        assert gate_line((start - 1e-9) % 360)[0] == GATE_ORDER[(i - 1) % 64]
        assert gate_line(start)[0] == gate
        assert gate_line((start + GATE_SIZE_DEG - 1e-9) % 360)[0] == gate

def test_line_boundaries():
    gate_start = 0.0
    gate = GATE_ORDER[0]
    for line in range(1, 7):
        start = gate_start + (line - 1) * LINE_SIZE_DEG
        assert gate_line((start + 1e-10) % 360) == (gate, line)
        if line < 6:
            assert gate_line((start + LINE_SIZE_DEG - 1e-10) % 360) == (gate, line)

def test_gate_order_has_exactly_64_unique_gates():
    assert len(GATE_ORDER) == 64
    assert len(set(GATE_ORDER)) == 64
    assert set(GATE_ORDER) == set(range(1, 65))
