import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { CornerDownLeft, FileText, Search, User, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

export type SearchItem = {
  href: string;
  label: string;
  group: string;
};

type GlobalSearchProps = {
  items: SearchItem[];
};

export default function GlobalSearch({ items }: GlobalSearchProps) {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
    const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const palette = {
    field: dark ? "#1e1e1e" : "#ffffff",
    border: dark ? "#333333" : "#e8e2da",
    text: dark ? "#ffffff" : "#16213a",
    muted: dark ? "#a0a0a0" : "#6b7280",
    hover: dark ? "#2a2a2a" : "#f4efe9",
    tile: dark ? "#2a2a2a" : "#f4efe9",
    accent: "#f2552c",
    ring: "rgba(242, 85, 44, 0.18)",
    shadow: dark ? "0 12px 32px rgba(0, 0, 0, 0.5)" : "0 12px 32px rgba(22, 33, 58, 0.14)",
  };

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => item.label.toLowerCase().includes(term));
  }, [items, query]);

    const groups = useMemo(() => {
    const out: { name: string; entries: { item: SearchItem; index: number }[] }[] = [];
    results.forEach((item, index) => {
      const last = out[out.length - 1];
      if (last && last.name === item.group) {
        last.entries.push({ item, index });
      } else {
        out.push({ name: item.group, entries: [{ item, index }] });
      }
    });
    return out;
  }, [results]);

  const shortcutLabel =
    typeof navigator !== "undefined" && /Mac/i.test(navigator.userAgent) ? "Cmd K" : "Ctrl K";

  const renderLabel = (label: string) => {
    const term = query.trim().toLowerCase();
    if (!term) return label;
    const start = label.toLowerCase().indexOf(term);
    if (start === -1) return label;
    const end = start + term.length;
    return (
      <>
        {label.slice(0, start)}
        <mark style={{ background: "transparent", color: palette.accent, fontWeight: 700 }}>
          {label.slice(start, end)}
        </mark>
        {label.slice(end)}
      </>
    );
  };

  useEffect(() => {
    if (!open) return;
    document
      .getElementById(`global-search-option-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const choose = (item: SearchItem) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    setLocation(item.href);
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (results.length ? (index + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        results.length ? (index - 1 + results.length) % results.length : 0
      );
    } else if (event.key === "Enter") {
      const item = results[activeIndex];
      if (item) {
        event.preventDefault();
        choose(item);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const searchBox = (
    <div
      ref={wrapRef}
      onClick={(event) => {
        if (isMobile && event.target === event.currentTarget) setOpen(false);
      }}
      style={
        isMobile
          ? {
              position: "fixed",
              inset: 0,
              zIndex: 100,
              boxSizing: "border-box",
              padding: 12,
              overflowY: "auto",
              background: dark ? "rgba(0, 0, 0, 0.6)" : "rgba(19, 34, 56, 0.35)",
            }
          : {
              position: "relative",
              width: focused || open ? 320 : 240,
              maxWidth: "100%",
              transition: "width 0.2s ease",
            }
      }
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 40,
          boxSizing: "border-box",
          padding: "0 10px 0 12px",
          borderRadius: 999,
          border: `1px solid ${focused ? palette.accent : palette.border}`,
          backgroundColor: palette.field,
          boxShadow: focused ? `0 0 0 3px ${palette.ring}` : "none",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        <Search
          size={16}
          aria-hidden="true"
          style={{ flexShrink: 0, color: focused ? palette.accent : palette.muted }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search pages"
          aria-label="Search pages"
          role="combobox"
          aria-expanded={open}
          aria-controls="global-search-results"
          aria-activedescendant={open && results[activeIndex] ? `global-search-option-${activeIndex}` : undefined}
          autoComplete="off"
          autoFocus={isMobile}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            color: palette.text,
            fontSize: 14,
          }}
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              flexShrink: 0,
              border: "none",
              borderRadius: 999,
              background: palette.tile,
              color: palette.muted,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <X size={13} />
          </button>
        ) : (
          <kbd
            aria-hidden="true"
            style={{
              flexShrink: 0,
              padding: "2px 7px",
              borderRadius: 6,
              border: `1px solid ${palette.border}`,
              background: palette.tile,
              color: palette.muted,
              fontFamily: "inherit",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {shortcutLabel}
          </kbd>
        )}
      </div>
      {open && (
        <div
          style={{
            position: isMobile ? "static" : "absolute",
            marginTop: isMobile ? 8 : 0,
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            overflow: "hidden",
            backgroundColor: palette.field,
            border: `1px solid ${palette.border}`,
            borderRadius: 14,
            boxShadow: palette.shadow,
            zIndex: 50,
          }}
        >
          <ul
            id="global-search-results"
            role="listbox"
            style={{
              maxHeight: 300,
              overflowY: "auto",
              margin: 0,
              padding: 6,
              listStyle: "none",
            }}
          >
            {results.length === 0 ? (
              <li style={{ padding: "16px 12px", color: palette.muted, fontSize: 14, textAlign: "center" }}>
                No pages match "{query.trim()}"
              </li>
            ) : (
              groups.map((group) => (
                <li key={group.name} role="presentation">
                  <div
                    style={{
                      padding: "8px 10px 4px",
                      color: palette.muted,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {group.name}
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {group.entries.map(({ item, index }) => {
                      const isActive = index === activeIndex;
                      const Icon = item.group === "Account" ? User : FileText;
                      return (
                        <li
                          key={`${item.group}-${item.href}-${item.label}`}
                          id={`global-search-option-${index}`}
                          role="option"
                          aria-selected={isActive}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => choose(item)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "7px 10px",
                            borderRadius: 10,
                            cursor: "pointer",
                            fontSize: 14,
                            color: palette.text,
                            backgroundColor: isActive ? palette.hover : "transparent",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 30,
                              height: 30,
                              flexShrink: 0,
                              borderRadius: 8,
                              background: isActive ? palette.accent : palette.tile,
                              color: isActive ? "#ffffff" : palette.muted,
                            }}
                          >
                            <Icon size={15} />
                          </span>
                          <span style={{ flex: 1, minWidth: 0 }}>{renderLabel(item.label)}</span>
                          {isActive && (
                            <CornerDownLeft size={14} style={{ flexShrink: 0, color: palette.muted }} />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))
            )}
          </ul>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              padding: "8px 14px",
              borderTop: `1px solid ${palette.border}`,
              color: palette.muted,
              fontSize: 12,
            }}
          >
            <span>Arrow keys to move</span>
            <span>Enter to open, Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile && !open) {
    return (
      <button
        type="button"
        className="icon-button"
        aria-label="Search pages"
        onClick={() => setOpen(true)}
      >
        <Search size={18} />
      </button>
    );
  }

  if (isMobile) {
    return createPortal(searchBox, document.body);
  }

  return searchBox;
}