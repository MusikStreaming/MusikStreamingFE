'use client';

import { useState, useReducer } from 'react';
import '@material/web/textfield/outlined-text-field';
import DragNDropZone from "@/app/components/inputs/dragndropzone";
import FilledButton from "@/app/components/buttons/filled-button";
import Dropdown from "@/app/components/inputs/dropdown";

export default function AddSong() {
  const formReducer = (state, action) => {
    switch (action.type) {
      case 'SET_TITLE': return { ...state, title: action.payload };
      case 'SET_ARTIST': return { ...state, artistId: action.payload };
      case 'SET_AUDIO_FILE': return { ...state, audioFile: action.payload };
      default: return state;
    }
  };

  const [formState, dispatch] = useReducer(formReducer, {
    title: '',
    artistId: null,
    audioFile: null
  });

  const [artists, setArtists] = useState([
    { id: 1, name: 'Artist 1' },
    { id: 2, name: 'Artist 2' },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement song upload
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <md-outlined-text-field
        label="Song Title"
        value={formState.title}
        onChange={(e) => dispatch({ type: 'SET_TITLE', payload: e.target.value })}
      />

      <div role="group" aria-label="Artist selection">
        <label className="text-[--md-sys-color-on-surface-variant]" id="artist-label">Artist</label>
        <Dropdown 
          options={artists.map(a => ({ value: a.id, label: a.name }))}
          onChange={(value) => dispatch({ type: 'SET_ARTIST', payload: value })}
          aria-labelledby="artist-label"
        />
      </div>

      <DragNDropZone
        supportText="Upload Audio File"
        onDrop={(files) => dispatch({ type: 'SET_AUDIO_FILE', payload: files[0] })}
        accept="audio/*"
      />

      <FilledButton type="submit">
        Upload Song
      </FilledButton>
    </form>
  );
}