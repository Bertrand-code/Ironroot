import React, { useState, useEffect } from 'react';
import { ironroot } from '@/lib/ironrootClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StickyNote, Plus, Trash2, Pin, Edit, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const formatDateTime = (value) => {
  if (!value) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export default function AdminNotepad() {
  const [user, setUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [],
    isPinned: false
  });
  const [tagInput, setTagInput] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await ironroot.auth.me();
        if (!['admin', 'owner'].includes(currentUser.role)) {
          window.location.href = '/login';
        }
        setUser(currentUser);
      } catch {
        window.location.href = '/login';
      }
    };
    checkAuth();
  }, []);

  const { data: notes = [] } = useQuery({
    queryKey: ['adminNotes'],
    queryFn: () => ironroot.entities.AdminNote.list('-created_date'),
    enabled: !!user,
  });

  const createNoteMutation = useMutation({
    mutationFn: (data) => ironroot.entities.AdminNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotes'] });
      resetForm();
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => ironroot.entities.AdminNote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotes'] });
      resetForm();
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => ironroot.entities.AdminNote.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotes'] });
    },
  });

  const resetForm = () => {
    setFormData({ title: '', content: '', category: 'general', tags: [], isPinned: false });
    setTagInput('');
    setIsCreating(false);
    setEditingNote(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, data: formData });
    } else {
      createNoteMutation.mutate(formData);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category,
      tags: note.tags || [],
      isPinned: note.isPinned
    });
    setIsCreating(true);
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const togglePin = (note) => {
    updateNoteMutation.mutate({
      id: note.id,
      data: { ...note, isPinned: !note.isPinned }
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      idea: 'bg-purple-500',
      task: 'bg-blue-500',
      reminder: 'bg-yellow-500',
      important: 'bg-red-500',
      general: 'bg-gray-500'
    };
    return colors[category] || colors.general;
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <StickyNote className="h-8 w-8 text-red-500" />
              Admin Notepad
            </h1>
            <p className="text-gray-400 mt-2">Quick notes and ideas for admin tasks</p>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-red-600 hover:bg-red-700"
          >
            {isCreating ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {isCreating ? 'Cancel' : 'New Note'}
          </Button>
        </div>

        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-gray-800 border-gray-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white">
                    {editingNote ? 'Edit Note' : 'Create New Note'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      placeholder="Note title..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-gray-900 border-gray-700 text-white"
                      required
                    />
                    <Textarea
                      placeholder="Write your note here..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="bg-gray-900 border-gray-700 text-white min-h-32"
                      required
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="idea">Idea</SelectItem>
                          <SelectItem value="task">Task</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                          <SelectItem value="important">Important</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="bg-gray-900 border-gray-700 text-white"
                        />
                        <Button type="button" onClick={addTag} variant="outline">Add</Button>
                      </div>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, idx) => (
                          <Badge key={idx} className="bg-blue-500 cursor-pointer" onClick={() => removeTag(tag)}>
                            {tag} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isPinned}
                        onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label className="text-sm text-gray-400">Pin this note to top</label>
                    </div>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                      {editingNote ? 'Update Note' : 'Create Note'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`bg-gray-800 border-gray-700 ${note.isPinned ? 'border-red-500 border-2' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(note.category)}>
                          {note.category}
                        </Badge>
                        {note.isPinned && <Pin className="h-4 w-4 text-red-500" />}
                      </div>
                      <h3 className="font-bold text-white">{note.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(note.created_date)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePin(note)}
                        className="h-8 w-8"
                      >
                        <Pin className={`h-4 w-4 ${note.isPinned ? 'text-red-500' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(note)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{note.content}</p>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {note.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {notes.length === 0 && !isCreating && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="py-12 text-center">
              <StickyNote className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No notes yet</p>
              <p className="text-gray-500 text-sm">Click "New Note" to create your first note</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
