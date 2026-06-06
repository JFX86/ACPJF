import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Eraser, Palette } from 'lucide-react';

interface PersonalNotesProps {
  storageKey: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const colors = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'White', value: '#ffffff' },
    { name: 'Gray', value: '#9ca3af' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-800 border-b border-gray-700 rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded flex items-center justify-center transition-colors ${editor.isActive('bold') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
        title="Gras"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded flex items-center justify-center transition-colors ${editor.isActive('italic') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
        title="Italique"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded flex items-center justify-center transition-colors ${editor.isActive('underline') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
        title="Souligné"
      >
        <UnderlineIcon size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded flex items-center justify-center transition-colors ${editor.isActive('strike') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
        title="Barré"
      >
        <Strikethrough size={16} />
      </button>
      
      <div className="w-px h-4 bg-gray-700 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded flex items-center justify-center transition-colors ${editor.isActive('bulletList') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
        title="Liste à puces"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded flex items-center justify-center transition-colors ${editor.isActive('orderedList') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
        title="Liste numérotée"
      >
        <ListOrdered size={16} />
      </button>
      
      <div className="w-px h-4 bg-gray-700 mx-1"></div>

      <div className="group relative flex items-center">
        <button className="p-1.5 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="Couleur du texte">
          <Palette size={16} />
        </button>
        <div className="absolute top-full left-0 pt-1 hidden group-hover:flex z-10">
          <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow-xl flex gap-1">
            {colors.map(color => (
              <button
                key={color.value}
                onClick={() => editor.chain().focus().setColor(color.value).run()}
                className="w-5 h-5 rounded-full border border-gray-600 transition-transform hover:scale-110"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            <button
              onClick={() => editor.chain().focus().unsetColor().run()}
              className="w-5 h-5 rounded-full border border-gray-600 bg-transparent flex items-center justify-center text-gray-400 hover:text-white transition-transform hover:scale-110"
              title="Couleur par défaut"
            >
               <Eraser size={12} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="w-px h-4 bg-gray-700 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="p-1.5 rounded flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
        title="Effacer le formatage"
      >
        <Eraser size={16} />
      </button>
    </div>
  )
}

export const PersonalNotes: React.FC<PersonalNotesProps> = ({ storageKey }) => {
  const [initialContent, setInitialContent] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`acp-notes-${storageKey}`);
      return saved !== null ? saved : '';
    } catch {
      return '';
    }
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-invert focus:outline-none min-h-[48px] p-3 text-gray-200',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      try {
        localStorage.setItem(`acp-notes-${storageKey}`, html);
      } catch (err) {
        console.error('Failed to save notes', err);
      }
    },
  });

  // Update notes if storageKey changes
  useEffect(() => {
    if (editor) {
      try {
        const saved = localStorage.getItem(`acp-notes-${storageKey}`);
        const content = saved !== null ? saved : '';
        if (editor.getHTML() !== content) {
            editor.commands.setContent(content);
        }
      } catch {
        editor.commands.setContent('');
      }
    }
  }, [storageKey, editor]);

  return (
    <div className="w-full mt-6 mb-2 text-left">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-visible flex flex-col">
        <div className="bg-gray-800/80 px-4 pt-3 pb-2 rounded-t-lg border-b border-gray-700">
           <label className="block text-sm font-semibold text-gray-300">
             Notes personnelles
           </label>
        </div>
        <MenuBar editor={editor} />
        <EditorContent editor={editor} className="bg-gray-900 rounded-b-lg" />
      </div>
      <style>{`
        .ProseMirror p {
           margin-top: 0.25em;
           margin-bottom: 0.25em;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          font-style: italic;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-top: 0.25em;
          margin-bottom: 0.25em;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-top: 0.25em;
          margin-bottom: 0.25em;
        }
      `}</style>
    </div>
  );
};


