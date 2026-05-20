"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Note = {
  id: number;
  title: string;
  content: string;
  pinned?: boolean;
  favorite?: boolean;
  folder?: string;
  tags?: string[];
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [notes, setNotes] = useState<
    Note[]
  >([]);

  const [title, setTitle] = useState("");
  const [content, setContent] =
    useState("");

  const [folder, setFolder] =
    useState("");

  const [tagsInput, setTagsInput] =
    useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [page, setPage] = useState(1);

  const limit = 12;

  const [darkMode, setDarkMode] =
    useState(false);

  const [selectedFolder, setSelectedFolder] =
    useState("All");

  const [showFavorites, setShowFavorites] =
    useState(false);

  const [showPinned, setShowPinned] =
    useState(false);

  // 🔐 CHECK LOGIN
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } =
        await supabase.auth.getUser();

      if (error || !data.user) {
        router.push("/login");
        return;
      }

      setUser(data.user);

      fetchNotes(data.user.id, 1);
    };

    checkUser();
  }, [router]);

  // 📥 FETCH NOTES
  const fetchNotes = async (
    userId: string,
    pageNumber = 1
  ) => {
    const from = (pageNumber - 1) * limit;

    const to = from + limit - 1;

    const { data, error } =
      await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("pinned", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        })
        .range(from, to);

    if (error) {
      console.error(error.message);
      return;
    }

    setNotes(data || []);
  };

  // ➕ ADD NOTE
  const addNote = async () => {
    if (!title || !content || !user)
      return;

    const { data, error } =
      await supabase
        .from("notes")
        .insert([
          {
            title,
            content,
            folder,
            tags:
              tagsInput.length > 0
                ? tagsInput
                    .split(",")
                    .map((tag) =>
                      tag.trim()
                    )
                : [],
            pinned: false,
            favorite: false,
            user_id: user.id,
          },
        ])
        .select();

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      setNotes((prev) => [
        ...data,
        ...prev,
      ]);
    }

    clearForm();
  };

  // ✏️ UPDATE NOTE
  const updateNote = async (
    id: number
  ) => {
    const { error } = await supabase
      .from("notes")
      .update({
        title,
        content,
        folder,
        tags:
          tagsInput.length > 0
            ? tagsInput
                .split(",")
                .map((tag) =>
                  tag.trim()
                )
            : [],
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? {
              ...note,
              title,
              content,
              folder,
              tags:
                tagsInput.length > 0
                  ? tagsInput
                      .split(",")
                      .map((tag) =>
                        tag.trim()
                      )
                  : [],
            }
          : note
      )
    );

    clearForm();
  };

  // 🗑️ DELETE NOTE
  const deleteNote = async (
    id: number
  ) => {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setNotes((prev) =>
      prev.filter(
        (note) => note.id !== id
      )
    );
  };

  // 📌 TOGGLE PIN
  const togglePin = async (
    id: number,
    pinned?: boolean
  ) => {
    const { error } = await supabase
      .from("notes")
      .update({
        pinned: !pinned,
      })
      .eq("id", id);

    if (error) return;

    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? {
              ...note,
              pinned: !pinned,
            }
          : note
      )
    );
  };

  // ⭐ TOGGLE FAVORITE
  const toggleFavorite = async (
    id: number,
    favorite?: boolean
  ) => {
    const { error } = await supabase
      .from("notes")
      .update({
        favorite: !favorite,
      })
      .eq("id", id);

    if (error) return;

    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? {
              ...note,
              favorite: !favorite,
            }
          : note
      )
    );
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();

    router.push("/");
  };

  // 🧹 CLEAR FORM
  const clearForm = () => {
    setTitle("");
    setContent("");
    setFolder("");
    setTagsInput("");
    setEditingId(null);
  };

  // 🔍 FILTER
  const filteredNotes = notes.filter(
    (note) => {
      const matchSearch =
        note.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        note.content
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchFolder =
        selectedFolder === "All"
          ? true
          : note.folder ===
            selectedFolder;

      const matchFavorite =
        showFavorites
          ? note.favorite === true
          : true;

      const matchPinned =
        showPinned
          ? note.pinned === true
          : true;

      return (
        matchSearch &&
        matchFolder &&
        matchFavorite &&
        matchPinned
      );
    }
  );

  // 📂 FOLDERS
  const folders = [
    "All",
    ...new Set(
      notes
        .map((note) => note.folder)
        .filter(
          (folder): folder is string =>
            Boolean(folder)
        )
    ),
  ];

  return (
    <main
    className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white"
          : "bg-[#f7f7f5] text-black"
      }`}
    >
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20">
        <div className="max-w-8xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
          <h1 className="text-2xl font-semibold tracking-tight">
              NotesFlow ✨
            </h1>

            <p className="text-xs text-zinc-500 mt-1">
              Welcome back,{" "}
              <span className="font-semibold">
                {user?.email}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* DARK MODE */}
            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
             className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/80 dark:bg-zinc-900 border border-black/5 dark:border-white/10 hover:scale-105 transition"
            >
              {darkMode
                ? "☀️"
                : "🌙"}
            </button>

            {/* LOGOUT */}
            <button
              onClick={logout}
             className="px-4 h-10 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-black transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="max-w-8xl mx-auto px-6 py-10">

        {/* SEARCH */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 Search notes..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full lg:w-[360px] h-11 px-4 rounded-xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-zinc-900 backdrop-blur text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        {/* LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT */}
          <div className="lg:col-span-3">
            <div className="sticky top-28">

              <div className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur rounded-2xl p-5 border border-black/5 dark:border-white/10 shadow-sm">

                <h2 className="text-lg font-semibold tracking-tight">
                  {editingId
                    ? "Edit Note ✏️"
                    : "Create Note 🚀"}
                </h2>

                <p className="text-zinc-500 text-xs mb-5">
                  Organize your thoughts beautifully.
                </p>

                <div className="space-y-4">

                  {/* TITLE */}
                  <input
                    value={title}
                    onChange={(e) =>
                      setTitle(
                        e.target.value
                      )
                    }
                    placeholder="Title..."
                    className="w-full h-11 px-4 rounded-xl border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
                  />

                  {/* FOLDER */}
                  <input
                    value={folder}
                    onChange={(e) =>
                      setFolder(
                        e.target.value
                      )
                    }
                    placeholder="Folder..."
                    className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:ring-4 focus:ring-yellow-200"
                  />

                  {/* TAGS */}
                  <input
                    value={tagsInput}
                    onChange={(e) =>
                      setTagsInput(
                        e.target.value
                      )
                    }
                    placeholder="Tags..."
                    className="w-full min-h-[180px] p-4 rounded-xl border border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 text-sm resize-none outline-none focus:ring-2 focus:ring-zinc-400"
                  />

                  {/* CONTENT */}
                  <textarea
                    rows={8}
                    value={content}
                    onChange={(e) =>
                      setContent(
                        e.target.value
                      )
                    }
                    placeholder="Write your note..."
                    className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 resize-none outline-none focus:ring-4 focus:ring-yellow-200"
                  />

                  {/* BUTTONS */}
                  <div className="flex gap-3">

                    <button
                      onClick={() => {
                        if (
                          editingId
                        ) {
                          updateNote(
                            editingId
                          );
                        } else {
                          addNote();
                        }
                      }}
                      className="flex-1 h-11 rounded-xl bg-yellow-400 text-black text-sm font-medium hover:bg-black transition"
                    >
                      {editingId
                        ? "Update"
                        : "Add Note"}
                    </button>

                    {editingId && (
                      <button
                        onClick={
                          clearForm
                        }
                        className="bg-gray-200 px-5 rounded-2xl hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE */}
          <div className="lg:col-span-2">

            <div className="sticky top-28">

              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">

                <h2 className="font-bold text-lg mb-4 text-black">
                  Folders
                </h2>

                <div className="space-y-2">

                  {/* ALL */}
                  <button
                    onClick={() => {
                      setSelectedFolder(
                        "All"
                      );

                      setShowFavorites(
                        false
                      );

                      setShowPinned(
                        false
                      );
                    }}
                    className={`w-full text-left px-3 h-10 rounded-xl text-sm transition font-medium ${
                      selectedFolder ===
                        "All" &&
                      !showFavorites &&
                      !showPinned
                        ? "bg-yellow-400 text-black"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    📂 All Notes
                  </button>

                  {/* FAVORITES */}
                  <button
                    onClick={() => {
                      setShowFavorites(
                        true
                      );

                      setShowPinned(
                        false
                      );

                      setSelectedFolder(
                        "All"
                      );
                    }}
                    className={`w-full text-left px-4 py-3 rounded-2xl transition font-medium ${
                      showFavorites
                        ? "bg-pink-400 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    ⭐ Favorites
                  </button>

                  {/* PINNED */}
                  <button
                    onClick={() => {
                      setShowPinned(
                        true
                      );

                      setShowFavorites(
                        false
                      );

                      setSelectedFolder(
                        "All"
                      );
                    }}
                    className={`w-full text-left px-4 py-3 rounded-2xl transition font-medium ${
                      showPinned
                        ? "bg-yellow-300 text-black"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    📌 Pinned
                  </button>

                  {/* DYNAMIC FOLDERS */}
                  {folders
                    .filter(
                      (
                        folderName
                      ) =>
                        folderName !==
                        "All"
                    )
                    .map(
                      (
                        folderName
                      ) => (
                        <button
                          key={
                            folderName
                          }
                          onClick={() => {
                            setSelectedFolder(
                              folderName
                            );

                            setShowFavorites(
                              false
                            );

                            setShowPinned(
                              false
                            );
                          }}
                          className={`w-full text-left px-4 py-3 rounded-2xl transition ${
                            selectedFolder ===
                            folderName
                              ? "bg-blue-500 text-white"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          📁{" "}
                          {
                            folderName
                          }
                        </button>
                      )
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-7">

            {/* EMPTY */}
            {filteredNotes.length ===
              0 && (
              <div className="bg-white rounded-3xl p-10 text-center shadow border border-gray-100">
                <h2 className="text-2xl font-bold text-black">
                  No notes found 😢
                </h2>

                <p className="text-gray-500 mt-2">
                  Start creating your first note.
                </p>
              </div>
            )}

            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">

              {filteredNotes.map(
                (note) => (
                  <div
                    key={note.id}
                    className="bg-white text-black rounded-2xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[280px] border border-gray-100"
                  >
                    {/* TOP */}
                    <div>

                      {/* ACTIONS */}
                      <div className="flex items-center justify-between mb-4">

                        <div className="flex gap-2">

                          {/* PIN */}
                          <button
                            onClick={() =>
                              togglePin(
                                note.id,
                                note.pinned
                              )
                            }
                            className={`px-3 py-2 rounded-xl transition ${
                              note.pinned
                                ? "bg-yellow-400"
                                : "bg-gray-200"
                            }`}
                          >
                            📌
                          </button>

                          {/* FAVORITE */}
                          <button
                            onClick={() =>
                              toggleFavorite(
                                note.id,
                                note.favorite
                              )
                            }
                            className={`px-3 py-2 rounded-xl transition ${
                              note.favorite
                                ? "bg-pink-400"
                                : "bg-gray-200"
                            }`}
                          >
                            ⭐
                          </button>
                        </div>

                        {/* FOLDER */}
                        {note.folder && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            📁{" "}
                            {
                              note.folder
                            }
                          </span>
                        )}
                      </div>

                      {/* TITLE */}
                      <h2 className="text-base font-semibold tracking-tight">
                        {note.title}
                      </h2>

                      {/* CONTENT */}
                      <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-sm leading-6">
                        {note.content}
                      </p>

                      {/* TAGS */}
                      <div className="flex flex-wrap gap-2 mt-4">

                        {note.tags?.map(
                          (
                            tag,
                            index
                          ) => (
                            <span
                              key={
                                index
                              }
                              className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full"
                            >
                              #{tag}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* BOTTOM */}
                    <div className="flex gap-3 mt-6">

                      <button
                        onClick={() =>
                          deleteNote(
                            note.id
                          )
                        }
                        className="flex-1 h-10 rounded-xl bg-red-500/90 text-white text-sm hover:bg-red-600 transition"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => {
                          setEditingId(
                            note.id
                          );

                          setTitle(
                            note.title
                          );

                          setContent(
                            note.content
                          );

                          setFolder(
                            note.folder ||
                              ""
                          );

                          setTagsInput(
                            note.tags?.join(
                              ", "
                            ) || ""
                          );

                          window.scrollTo(
                            {
                              top: 0,
                              behavior:
                                "smooth",
                            }
                          );
                        }}
                        className="flex-1 h-10 rounded-xl bg-zinc-900 text-white text-sm hover:bg-black transition"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center gap-4 mt-10">

              <button
                onClick={() => {
                  if (page > 1) {
                    const newPage =
                      page - 1;

                    setPage(newPage);

                    fetchNotes(
                      user.id,
                      newPage
                    );
                  }
                }}
                className="bg-white text-black px-5 py-2 rounded-2xl border border-gray-200"
              >
                Prev
              </button>

              <button
                onClick={() => {
                  const newPage =
                    page + 1;

                  setPage(newPage);

                  fetchNotes(
                    user.id,
                    newPage
                  );
                }}
                className="bg-black text-white px-5 py-2 rounded-2xl"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}