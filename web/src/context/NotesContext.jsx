import React, { createContext, useContext } from 'react';
import { useNotesProvider } from '../services/notes-service/use-notes-provider';

const NotesContext = createContext(null);

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes deve ser usado dentro de um NotesProvider');
  }
  return context;
}

export function NotesProvider({ children }) {
  const notes = useNotesProvider();

  return (
    <NotesContext.Provider value={notes}>
      {children}
    </NotesContext.Provider>
  );
}