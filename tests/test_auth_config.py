import unittest

from api.auth_config import public_auth_config


class PublicAuthConfigTests(unittest.TestCase):
    def test_missing_supabase_keys_disables_every_auth_method(self):
        config = public_auth_config({"KY_AUTH_GOOGLE_ENABLED": "true"})
        self.assertFalse(config["configured"])
        self.assertEqual(config["supabaseUrl"], "")
        self.assertEqual(config["supabaseKey"], "")
        self.assertFalse(config["emailPasswordEnabled"])
        self.assertEqual(config["providers"], {"google": False, "apple": False, "facebook": False})

    def test_public_config_exposes_only_public_key_and_enabled_flags(self):
        config = public_auth_config({
            "SUPABASE_URL": " https://example.supabase.co/ ",
            "SUPABASE_PUBLISHABLE_KEY": "sb_publishable_public-value",
            "KY_AUTH_GOOGLE_ENABLED": "true",
            "KY_AUTH_APPLE_ENABLED": "1",
            "KY_AUTH_FACEBOOK_ENABLED": "false",
            "GOOGLE_CLIENT_SECRET": "must-never-be-returned",
        })
        self.assertTrue(config["configured"])
        self.assertEqual(config["supabaseUrl"], "https://example.supabase.co")
        self.assertEqual(config["supabaseKey"], "sb_publishable_public-value")
        self.assertTrue(config["emailPasswordEnabled"])
        self.assertEqual(config["providers"], {"google": True, "apple": True, "facebook": False})
        self.assertNotIn("GOOGLE_CLIENT_SECRET", str(config))

    def test_legacy_anon_key_is_supported(self):
        config = public_auth_config({
            "SUPABASE_URL": "https://example.supabase.co",
            "SUPABASE_ANON_KEY": "legacy-public-anon-key",
        })
        self.assertTrue(config["configured"])
        self.assertEqual(config["supabaseKey"], "legacy-public-anon-key")

    def test_provider_flag_defaults_to_disabled(self):
        config = public_auth_config({
            "SUPABASE_URL": "https://example.supabase.co",
            "SUPABASE_PUBLISHABLE_KEY": "sb_publishable_public-value",
        })
        self.assertFalse(any(config["providers"].values()))


if __name__ == "__main__":
    unittest.main()
