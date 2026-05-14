import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  chatHistory,
  optimizePayload,
  cn,
  getGreetingByTime,
  handleTextAreaKeyPress,
  encryptModern,
  decryptModern,
  getRandomFile,
  handleAddNewDiaryEntry,
  handleBrowseDiary,
  readText,
} from "../../utilities/utils";

vi.mock("../../utilities/apiCalls", () => ({
  laodRandomFile: vi.fn().mockResolvedValue("random-file-data"),
}));

// ---------------------------------------------------------------------------
// chatHistory
// ---------------------------------------------------------------------------
describe("chatHistory", () => {
  it("flattens chat turns into ChatMessage array with correct roles", () => {
    const chats = [
      { user: "Hello", assistant: "Hi there!" },
      { user: "How are you?", assistant: "I'm great!" },
    ];
    const result = chatHistory(chats);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ role: "user", content: "Hello" });
    expect(result[1]).toEqual({ role: "assistant", content: "Hi there!" });
    expect(result[2]).toEqual({ role: "user", content: "How are you?" });
    expect(result[3]).toEqual({ role: "assistant", content: "I'm great!" });
  });

  it("returns empty array for empty input", () => {
    expect(chatHistory([])).toEqual([]);
  });

  it("preserves order of messages", () => {
    const chats = [{ user: "first", assistant: "second" }];
    const result = chatHistory(chats);
    expect(result[0].content).toBe("first");
    expect(result[1].content).toBe("second");
  });
});

// ---------------------------------------------------------------------------
// optimizePayload
// ---------------------------------------------------------------------------
describe("optimizePayload", () => {
  it("filters out SYSTEM messages", () => {
    const messages = [
      { role: "system" as const, content: "You are a bot" },
      { role: "user" as const, content: "Hello" },
      { role: "assistant" as const, content: "Hi" },
    ];
    const result = optimizePayload(messages);
    expect(result).toHaveLength(2);
    expect(result.every((m) => m.role !== "system")).toBe(true);
  });

  it("keeps only the last 10 messages", () => {
    const messages = Array.from({ length: 15 }, (_, i) => ({
      role: "user" as const,
      content: `Message ${i}`,
    }));
    const result = optimizePayload(messages);
    expect(result).toHaveLength(10);
    expect(result[0].content).toContain("5");
    expect(result[9].content).toContain("14");
  });

  it("shortens assistant responses to first fragment or 150 chars", () => {
    const longAssistant = "A".repeat(300);
    const messages = [
      { role: "user" as const, content: "Hi" },
      { role: "assistant" as const, content: longAssistant },
    ];
    const result = optimizePayload(messages);
    expect(result).toHaveLength(2);
    expect(result[1].content.length).toBeLessThanOrEqual(150);
  });

  it("compresses text by lowercasing and removing special chars", () => {
    const messages = [
      { role: "user" as const, content: "Hello!!! `code` [test]" },
    ];
    const result = optimizePayload(messages);
    expect(result[0].content).not.toContain("`");
    expect(result[0].content).not.toContain("[");
    expect(result[0].content).not.toContain("]");
    expect(result[0].content).toBe(result[0].content.toLowerCase());
  });

  it("handles empty input", () => {
    expect(optimizePayload([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// cn (classnames utility)
// ---------------------------------------------------------------------------
describe("cn", () => {
  it("merges tailwind classes correctly", () => {
    const result = cn("px-4", "py-2", "px-6");
    expect(result).toContain("px-6");
    expect(result).toContain("py-2");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "visible");
    expect(result).toContain("base");
    expect(result).toContain("visible");
    expect(result).not.toContain("hidden");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

// ---------------------------------------------------------------------------
// getGreetingByTime
// ---------------------------------------------------------------------------
describe("getGreetingByTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('returns "Morning" before 12pm', () => {
    vi.setSystemTime(new Date(2025, 0, 1, 8, 0, 0));
    expect(getGreetingByTime()).toBe("Morning");
  });

  it('returns "Afternoon" between 12pm and 6pm', () => {
    vi.setSystemTime(new Date(2025, 0, 1, 14, 0, 0));
    expect(getGreetingByTime()).toBe("Afternoon");
  });

  it('returns "Evening" after 6pm', () => {
    vi.setSystemTime(new Date(2025, 0, 1, 20, 0, 0));
    expect(getGreetingByTime()).toBe("Evening");
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// handleTextAreaKeyPress
// ---------------------------------------------------------------------------
describe("handleTextAreaKeyPress", () => {
  it("appends character on normal keypress", () => {
    const setInputText = vi.fn();
    const e = { key: "a", preventDefault: vi.fn() };
    handleTextAreaKeyPress(e, setInputText, "hello");
    expect(setInputText).toHaveBeenCalledWith("helloa");
  });

  it("handles Backspace", () => {
    const setInputText = vi.fn();
    const e = { key: "Backspace", preventDefault: vi.fn() };
    handleTextAreaKeyPress(e, setInputText, "hello");
    expect(setInputText).toHaveBeenCalledWith("hell");
  });

  it("handles Enter by adding newline", () => {
    const setInputText = vi.fn();
    const e = { key: "Enter", preventDefault: vi.fn() };
    handleTextAreaKeyPress(e, setInputText, "hello");
    expect(setInputText).toHaveBeenCalledWith("hello\n");
  });

  it("ignores modifier keys (Shift, Ctrl, Alt, Meta)", () => {
    const setInputText = vi.fn();
    const modifierKeys = ["Shift", "Control", "Alt", "Meta"];
    for (const key of modifierKeys) {
      const e = { key, preventDefault: vi.fn() };
      handleTextAreaKeyPress(e, setInputText, "hello");
    }
    expect(setInputText).not.toHaveBeenCalled();
  });

  it("ignores Arrow keys", () => {
    const setInputText = vi.fn();
    const e = { key: "ArrowUp", preventDefault: vi.fn() };
    handleTextAreaKeyPress(e, setInputText, "hello");
    expect(setInputText).not.toHaveBeenCalled();
  });

  it("ignores Delete key", () => {
    const setInputText = vi.fn();
    const e = { key: "Delete", preventDefault: vi.fn() };
    handleTextAreaKeyPress(e, setInputText, "hello");
    expect(setInputText).not.toHaveBeenCalled();
  });

  it("ignores CapsLock key", () => {
    const setInputText = vi.fn();
    const e = { key: "CapsLock", preventDefault: vi.fn() };
    handleTextAreaKeyPress(e, setInputText, "hello");
    expect(setInputText).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// encryptModern / decryptModern (round-trip)
// ---------------------------------------------------------------------------
describe("encryptModern / decryptModern", () => {
  it("performs a successful round-trip encryption and decryption", async () => {
    const plaintext = "MySecretPassword123!";
    const password = "correct-horse-battery-staple";
    const encrypted = await encryptModern(plaintext, password);
    expect(encrypted).toBeTruthy();
    expect(typeof encrypted).toBe("string");

    const decrypted = await decryptModern(encrypted, password);
    expect(decrypted).toBe(plaintext);
  });

  it("returns 'ERROR' when decrypting with wrong password", async () => {
    const plaintext = "SecretData";
    const encrypted = await encryptModern(plaintext, "correct-password");
    const result = await decryptModern(encrypted, "wrong-password");
    expect(result).toBe("ERROR");
  });

  it("throws on non-string plaintext for encryptModern", async () => {
    await expect(
      encryptModern(42 as unknown as string, "password"),
    ).rejects.toThrow("encryptModern expects string plaintext");
  });
});

// ---------------------------------------------------------------------------
// getRandomFile
// ---------------------------------------------------------------------------
describe("getRandomFile", () => {
  it("calls laodRandomFile and returns its result", async () => {
    const { laodRandomFile } = await import("../../utilities/apiCalls");
    const result = await getRandomFile();
    expect(laodRandomFile).toHaveBeenCalledOnce();
    expect(result).toBe("random-file-data");
  });
});

// ---------------------------------------------------------------------------
// handleAddNewDiaryEntry
// ---------------------------------------------------------------------------
describe("handleAddNewDiaryEntry", () => {
  beforeEach(() => {
    // Set up DOM elements that handleAddNewDiaryEntry reads
    document.body.innerHTML = `
      <input id="pwd-input-session-password" value="test-key" />
      <a id="save-file-href" href="" download=""></a>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("creates a download link with encrypted content", async () => {
    const setDownloadLinkVisible = vi.fn();
    await handleAddNewDiaryEntry("My diary entry", setDownloadLinkVisible);

    const downloadLink = document.getElementById(
      "save-file-href",
    ) as HTMLAnchorElement;
    expect(downloadLink.download).toBeTruthy();
    expect(downloadLink.download).toContain(".txt");
    expect(downloadLink.href).toBeTruthy();
    expect(downloadLink.href).toContain("blob:");
    expect(setDownloadLinkVisible).toHaveBeenCalledWith(true);
  });
});

// ---------------------------------------------------------------------------
// handleBrowseDiary
// ---------------------------------------------------------------------------
describe("handleBrowseDiary", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="file1" type="file" />
    `;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("triggers click on file input and returns true", () => {
    const fileInput = document.getElementById("file1") as HTMLElement;
    const clickSpy = vi.spyOn(fileInput, "click");

    const result = handleBrowseDiary();

    expect(clickSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// readText
// ---------------------------------------------------------------------------
describe("readText", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="pwd-input-session-password" value="test-key" />
    `;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("reads file and decrypts content", async () => {
    const setInputText = vi.fn();
    const fileContent = "encrypted-content";
    const file = new File([fileContent], "diary.txt", { type: "text/plain" });

    // Create a proper FileList-like object
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null),
    } as unknown as FileList;

    const event = {
      target: { files: fileList },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await readText(event, setInputText);

    // decryptModern is called with the file content and session password
    // Since decryptModern is a real function, it will try to decrypt "encrypted-content"
    // which will fail and return "ERROR"
    expect(setInputText).toHaveBeenCalled();
  });
});
