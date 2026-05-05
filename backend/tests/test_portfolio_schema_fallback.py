from app.api.routes.portfolios import (
    _execute_portfolio_write_with_user_template_fallback,
    _is_missing_portfolios_user_template_id_column_error,
)


class _FakeResponse:
    def __init__(self, payload):
        self.data = [payload]


def test_detects_missing_user_template_id_column_error():
    error = Exception(
        "{'message': \"Could not find the 'user_template_id' column of 'portfolios' in the schema cache\", 'code': 'PGRST204'}"
    )
    assert _is_missing_portfolios_user_template_id_column_error(error) is True


def test_ignores_unrelated_errors():
    error = Exception("{'message': 'permission denied', 'code': '42501'}")
    assert _is_missing_portfolios_user_template_id_column_error(error) is False


def test_retries_without_user_template_id_when_schema_is_stale():
    calls = []

    def _writer(payload):
        calls.append(dict(payload))
        if len(calls) == 1:
            raise Exception(
                "{'message': \"Could not find the 'user_template_id' column of 'portfolios' in the schema cache\", 'code': 'PGRST204'}"
            )
        return _FakeResponse(payload)

    response = _execute_portfolio_write_with_user_template_fallback(
        payload={"name": "Test", "user_template_id": "abc-123"},
        write_operation=_writer,
    )

    assert len(calls) == 2
    assert "user_template_id" in calls[0]
    assert "user_template_id" not in calls[1]
    assert response.data[0]["name"] == "Test"


def test_retries_without_user_template_id_when_value_is_null():
    calls = []

    def _writer(payload):
        calls.append(dict(payload))
        if len(calls) == 1:
            raise Exception(
                "{'message': \"Could not find the 'user_template_id' column of 'portfolios' in the schema cache\", 'code': 'PGRST204'}"
            )
        return _FakeResponse(payload)

    response = _execute_portfolio_write_with_user_template_fallback(
        payload={"name": "Test", "user_template_id": None},
        write_operation=_writer,
    )

    assert len(calls) == 2
    assert "user_template_id" in calls[0]
    assert "user_template_id" not in calls[1]
    assert response.data[0]["name"] == "Test"
