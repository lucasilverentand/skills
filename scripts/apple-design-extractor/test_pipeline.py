import importlib.util
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent


def load(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class PipelineTests(unittest.TestCase):
    def test_current_output_and_overwrite_guard(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            source = root / "slices/ios"
            source.mkdir(parents=True)
            (source / "buttons.md").write_text("# Buttons\nUse clear labels.\n")
            files = load("scaffold").stage_references(root / "slices", root / "staged", ["ios"])
            self.assertEqual(files, [root / "staged/plugins/apple/skills/platforms/references/ios/buttons.md"])
            self.assertEqual(files[0].read_text(), "# Buttons\nUse clear labels.\n")
            self.assertEqual(len(list((root / "staged").rglob("*.*"))), 1)
            with self.assertRaises(FileExistsError):
                load("scaffold").stage_references(root / "slices", root / "staged", ["ios"])

    def test_model_selects_source(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            source = root / "apple-design-md-paraphrased-provider_new-model"
            source.mkdir()
            (source / "buttons.md").write_text("# Buttons\n\nPrefer clear labels.\n\n## Guidance\n\nUse contrast.\n")
            result = subprocess.run([sys.executable, str(ROOT / "slice.py"), "--model", "provider/new-model", "--workspace-root", str(root), "--output-root", str(root / "out")], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue((root / "out/ios/buttons.md").exists())
            self.assertFalse((root / "plugins").exists())

    def test_nested_reference_path(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            source = root / "slices/macos/windows"
            source.mkdir(parents=True)
            (source / "toolbars.md").write_text("# Toolbars\n")
            files = load("scaffold").stage_references(root / "slices", root / "staged", ["macos"])
            self.assertEqual(files[0].relative_to(root / "staged").as_posix(), "plugins/apple/skills/platforms/references/macos/windows/toolbars.md")

    def test_slice_requires_source(self):
        result = subprocess.run([sys.executable, str(ROOT / "slice.py"), "--output-root", "/tmp/unused-recovery-test"], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("provide --input-root or --model", result.stderr)

    def test_internal_links(self):
        self.assertEqual(load("optimize").compress_links("[Color](https://developer.apple.com/design/human-interface-guidelines/color)"), "[Color](color.md)")

    def test_api_links(self):
        self.assertEqual(load("optimize").compress_links("[API](https://developer.apple.com/documentation/UIKit/UIBlurEffect)"), "[API](apple:UIKit/UIBlurEffect)")

    def test_history_sections(self):
        self.assertNotIn("Change log", load("optimize").strip_trailing_sections("# Title\nbody\n### Change log\nold"))

    def test_blank_lines(self):
        self.assertLessEqual(load("optimize").collapse_blank_lines("a\n\n\n\nb").count("\n"), 3)


if __name__ == "__main__":
    unittest.main()
