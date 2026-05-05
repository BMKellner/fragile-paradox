import unittest

from app.models.user_templates import UserTemplateCreate, UserTemplateUpdate


class UserTemplateModelTests(unittest.TestCase):
    def test_create_payload_defaults_versioned_fields(self):
        payload = UserTemplateCreate(
            name="My template",
            template_id="1",
            document={"schema_version": 1, "root": {"id": "root", "type": "root"}},
        )

        self.assertEqual(payload.schema_version, 1)
        self.assertEqual(payload.template_id, "1")
        self.assertIn("root", payload.document)

    def test_update_payload_supports_non_version_bump(self):
        payload = UserTemplateUpdate(
            increment_version=False,
            portfolio_id="portfolio-1",
            change_summary="Link portfolio",
        )

        self.assertFalse(payload.increment_version)
        self.assertEqual(payload.portfolio_id, "portfolio-1")
        self.assertEqual(payload.change_summary, "Link portfolio")


if __name__ == "__main__":
    unittest.main()
