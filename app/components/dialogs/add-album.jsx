'use client'
import { useState, useReducer, useEffect, useCallback } from "react";
import '@material/web/textfield/outlined-text-field'
import DragNDropZone from "@/app/components/inputs/dragndropzone";
import { searchArtist } from "@/app/api-fetch/search-artist";
import { addCollection } from "@/app/api-fetch/add-collection";
import debounce from "lodash/debounce";
import FilledButton from "@/app/components/buttons/filled-button";
import SongChip from "../../manager/discography/add/song-chip";
import Dropdown from "@/app/components/inputs/dropdown";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from 'cookies-next';
import OutlinedIcon from "@/app/components/icons/outlined-icon";
import OutlinedFilledIcon from "@/app/components/icons/outlined-filled-icon";

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
        return { ...state, file: action.payload };
      case 'SET_ARTIST':
        return { ...state, artistId: action.payload };
      default:
        return state;
    }
  };
  const [formState, formDispatch] = useReducer(formReducer, {
    albumTitle: "",
    description: "",
    type: "Album",
    file: null,
    visibility: "Public",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [albumCoverPreview, setAlbumCoverPreview] = useState(null);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [artists, setArtists] = useState([]);
  const [artistSearch, setArtistSearch] = useState('');
  const [artistResults, setArtistResults] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);

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
  // fetch artists list
  // const { data: artistsData } = useQuery({
  //   queryKey =['artists'],
  //   queryFn: async () => {
  //     const response = await fetch(`/${process.env.NEXT_PUBLIC_API_URL}/v1/artist?page=1&limit=10`);
  //     return response.json();
  //   }
  // });

  // useEffect(() => {
  //   if (artistsData) {
  //     setArtists(artistsData);
  //   }
  // }, [artistsData]);

  useEffect(() => {
    const searchArtists = async () => {
      if (!artistSearch) {
        setArtistResults([]);
        return;
      }

      const token = getCookie('session_token');
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/search/${artistSearch}/artists`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setArtistResults(data.data.artists);
        }
      } catch (error) {
        console.error('Error searching artists:', error);
      }
    };

    const debounce = setTimeout(searchArtists, 300);
    return () => clearTimeout(debounce);
  }, [artistSearch]);

  const handleArtistAdd = (artist) => {
    if (!selectedArtists.find(a => a.id === artist.id)) {
      setSelectedArtists([...selectedArtists, artist]);
      setArtistSearch('');
    }
  };

  const handleAddAlbum = async () => {
    try {
      setSubmitStatus({type: 'success', message: ""})
      const formData = new FormData();
      formData.append('file', formState.file);
      formData.append('title', formState.albumTitle);
      formData.append('description', formState.description);
      formData.append('type', formState.type);
      formData.append('visibility', formState.visibility);
      const response = await fetch("/api/collection", {
        method: "POST",
        body: formData,
        headers: {
          'Authorization': `Bearer ${getCookie('session_token')}`
        }
      });
      const result = await response.json();
      console.log(result);
      setSubmitStatus({ type: 'success', message: 'Album added successfully!' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message 
        || 'Failed to add album. Please try again.'
      });
    }
  };

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={(e) => {
      e.preventDefault();
      handleAddAlbum();
    }}>
      
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
          options={["Album", "EP", "Single"].map(type => ({ value: type, label: type }))}
          defaultValue={{ value: "Album", label: "Album" }}
          onChange={(selectedOption) => {
            formDispatch({ type: 'SET_TYPE', payload: selectedOption.value });
          }}
          tabIndex="0"
          aria-labelledby="type-label"
        />
      </div>

      <div role="group" aria-label="Album visibility selection">
        <label className="text-[--md-sys-color-on-surface-variant]" id="visibility-label">Visibility</label>
        <Dropdown
          options={["Public", "Unreleased"].map(visibility => ({ value: visibility, label: visibility }))}
          defaultValue={{ value: "Public", label: "Public" }}
          onChange={(selectedOption) => {
            formDispatch({ type: 'SET_VISIBILITY', payload: selectedOption.value });
          }}
          tabIndex="0"
          aria-labelledby="visibility-label"
        />
      </div>

      {/* <div role="group" aria-label="Artist selection">
        <label className="text-[--md-sys-color-on-surface-variant]" id="artist-label">Artist</label>
        <Dropdown
          options={artists.map(a => ({ value: a.id, label: a.name }))}
          onChange={(value) => formDispatch({ type: 'SET_ARTIST', payload: value })}
          tabIndex="0"
          aria-labelledby="artist-label"
        />
      </div> */}

      <div role="group" className="flex flex-wrap gap-2 mb-2">
        {selectedArtists.map((artist) => (
          <div key={artist.id} className="flex items-center justify-center gap-2 bg-[--md-sys-color-surface-container] px-2 py-1 rounded-md">
            <span>{artist.name}</span>
            <button
              type="button"
              onClick={() => setSelectedArtists(selectedArtists.filter(a => a.id !== artist.id))}
              className="text-red-500 flex"
            >
              <OutlinedIcon icon="close" />
            </button>
          </div>
        ))}
      </div>
      <md-outlined-text-field
        type="text"
        placeholder="Search Artists"
        className="input-class w-full"
        label="Search Artists"
        value={artistSearch}
        tabIndex="0"
        onChange={(e) => setArtistSearch(e.target.value)}
      />
      {artistResults.length > 0 && (
        <div className="mt-2 max-h-40 overflow-y-auto border border-[--md-sys-color-outline] rounded-md">
          {artistResults.map((artist) => (
            <div
              key={artist.id}
              onClick={() => handleArtistAdd(artist)}
              onKeyDown={() => handleArtistAdd(artist)}
              className="px-4 py-2 cursor-pointer hover:bg-[--md-sys-color-surface-container]"
            >
              {artist.name}
            </div>
          ))}
        </div>
      )}
      <FilledButton type="submit" className="" tabIndex="0">
        Save
      </FilledButton>
      {submitStatus.message && (
        <div className={`p-4 rounded ${submitStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex gap-2`}>
          <OutlinedIcon icon={submitStatus.type === 'success' ? "check" : "close"} />
          {submitStatus.message}
        </div>
      )}
    </form>
  );
}