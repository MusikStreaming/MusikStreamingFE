import { useState, useReducer, useEffect, useCallback } from "react";
import '@material/web/textfield/outlined-text-field'
import DragNDropZone from "@/app/components/inputs/dragndropzone";
import { searchArtist } from "@/app/api-fetch/search-artist";
import { addCollection } from "@/app/api-fetch/add-collection";
import debounce from "lodash/debounce";
import FilledButton from "@/app/components/buttons/filled-button";
import SongChip from "./song-chip";
import Dropdown from "@/app/components/inputs/dropdown";

export default function AddAlbum() {
  const formReducer = (state, action) => {
    switch (action.type) {
      case 'SET_ALBUM_TITLE':
        return { ...state, albumTitle: action.payload };
      case 'SET_DESCRIPTION':
        return { ...state, description: action.payload };
      case 'SET_TYPE':
        return { ...state, type: action.payload };
      case 'SET_VISIBILITY':
        return { ...state, visibility: action.payload };
      case 'SET_ALBUM_COVER':
        return { ...state, albumCover: action.payload };
      case 'SET_ARTIST':
        return { ...state, artistId: action.payload };
      default:
        return state;
    }
  };
  const [formState, formDispatch] = useReducer(formReducer, {
    albumTitle: "",
    description: "",
    type: "",
    albumCover: null,
  });
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [albumCoverPreview, setAlbumCoverPreview] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [artists, setArtists] = useState([]);

  const onDropAlbumCover = useCallback((acceptedFiles) => {
    if (!Array.isArray(acceptedFiles) || acceptedFiles.length === 0) {
      return;
    }
    const previewUrl = URL.createObjectURL(acceptedFiles[0]);
    setAlbumCoverPreview(previewUrl);
    formDispatch({ type: 'SET_ALBUM_COVER', payload: acceptedFiles[0] });
  }, [setAlbumCoverPreview]);

  const debouncedSearchArtist = debounce(async () => {
    if (formState.artist.trim()) {
      const results = await searchArtist(formState.artist);
      setSearchResults(results);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, 100);

  useEffect(() => {
    return () => {
      debouncedSearchArtist.cancel();
    };
  }, [debouncedSearchArtist]);

  useEffect(() => {
    // TODO: Fetch artists list
    setArtists([
      { id: 1, name: 'Artist 1' },
      { id: 2, name: 'Artist 2' },
    ]);
  }, []);

  const handleAddAlbum = async () => {
    try {
      const response = await addCollection({
        file: formState.albumCover,
        title: formState.albumTitle,
        description: formState.description,
        type: formState.type,
        visibility: formState.visibility,
      });
      setSubmitStatus({ type: 'success', message: 'Album added successfully!' });
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to add album. Please try again.'
      });
    }
  };

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={(e) => {
      e.preventDefault();
      handleAddAlbum();
    }}>
      {submitStatus.message && (
        <div className={`p-4 rounded ${submitStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className="material-symbols-outlined">check</span>
          {submitStatus.message}
        </div>
      )}
      <div className="flex gap-2 w-full">
        <DragNDropZone 
          supportText="Album Cover" 
          onDrop={onDropAlbumCover} 
          avatarPreview={albumCoverPreview}
          tabIndex="0"
          role="button"
          aria-label="Upload album cover"
        />
      </div>
      <md-outlined-text-field 
        type="text" 
        placeholder="Album Title" 
        className="input-class" 
        label="Album Title" 
        value={formState.albumTitle}
        tabIndex="0" 
        onChange={(e) => formDispatch({ type: 'SET_ALBUM_TITLE', payload: e.target.value })}
      />
      <md-outlined-text-field 
        type="textarea" 
        placeholder="Description" 
        className="input-class w-full" 
        label="Description" 
        value={formState.description}
        tabIndex="0" 
        onChange={(e) => {
          formDispatch({ type: 'SET_DESCRIPTION', payload: e.target.value });
        }}
      />

      <div role="group" aria-label="Album type selection">
        <label className="text-[--md-sys-color-on-surface-variant]" id="type-label">Type</label>
        <Dropdown 
          options={["Album", "EP", "Single"]} 
          defaultValue="Album" 
          onChange={(e) => {
            formDispatch({ type: 'SET_TYPE', payload: e });
          }}
          tabIndex="0"
          aria-labelledby="type-label"
        />
      </div>

      <div role="group" aria-label="Album visibility selection">
        <label className="text-[--md-sys-color-on-surface-variant]" id="visibility-label">Visibility</label>
        <Dropdown 
          options={["Public", "Unreleased"]} 
          defaultValue="Public" 
          onChange={(e) => {
            formDispatch({ type: 'SET_VISIBILITY', payload: e });
          }}
          tabIndex="0"
          aria-labelledby="visibility-label"
        />
      </div>

      <div role="group" aria-label="Artist selection">
        <label className="text-[--md-sys-color-on-surface-variant]" id="artist-label">Artist</label>
        <Dropdown 
          options={artists.map(a => ({ value: a.id, label: a.name }))}
          onChange={(value) => formDispatch({ type: 'SET_ARTIST', payload: value })}
          tabIndex="0"
          aria-labelledby="artist-label"
        />
      </div>

      <FilledButton type="submit" className="" tabIndex="0">
        Save
      </FilledButton> 
    </form>
  );
}