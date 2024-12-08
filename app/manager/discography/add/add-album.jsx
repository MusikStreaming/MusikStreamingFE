import { useState, useReducer, useEffect } from "react";
import '@material/web/textfield/outlined-text-field'
import DragNDropZone from "@/app/components/inputs/dragndropzone";
import { searchArtist } from "@/app/api-fetch/search-artist";
import debounce from "lodash/debounce";
import FilledButton from "@/app/components/buttons/filled-button";
import SongChip from "./song-chip";

export default function AddAlbum() {
  const formReducer = (state, action) => {
    switch (action.type) {
      case 'SET_ALBUM_TITLE':
        return { ...state, albumTitle: action.payload };
      case 'SET_DESCRIPTION':
        return { ...state, description: action.payload };
      case 'SET_TYPE':
        return { ...state, type: action.payload };
      case 'SET_SELECTED_SONGS':
        return { ...state, selectedSongs: action.payload };
      default:
        return state;
    }
  };
  const [formState, formDispatch] = useReducer(formReducer, {
    albumTitle: "",
    description: "",
    type: "",
    albumCover: null,
    selectedSongs: [],
  });
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

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

  const handleSelectArtist = (selectedArtist) => {
    formDispatch({ type: 'SET_ARTIST', payload: selectedArtist });
    setShowDropdown(false);
  };

  return (
    <form className="flex flex-col gap-4 w-full">
      <div className="flex gap-2 w-full">
        <DragNDropZone supportText="Album Cover" />
      </div>
      <md-outlined-text-field 
        type="text" 
        placeholder="Album Title" 
        className="input-class" 
        label="Album Title" 
        value={formState.albumTitle} 
        onChange={(e) => formDispatch({ type: 'SET_ALBUM_TITLE', payload: e.target.value })}
      />

      <md-outlined-text-field 
        type="textarea" 
        placeholder="Description" 
        className="input-class w-full" 
        label="Description" 
        value={formState.description} 
        onChange={(e) => {
          formDispatch({ type: 'SET_DESCRIPTION', payload: e.target.value });
        }}
      />

      {/* <md-outlined-text-field 
        type="date" 
        placeholder="Release Date" 
        className="input-class w-full" 
        label="Release Date" 
        value={formState.releaseDate} 
      /> */}

      <md-outlined-text-field 
        type="text"
        placeholder="Type"
        className="input-class w-full"
        label="Type"
        value={formState.type}
      />
      <div className="flex gap-2 w-full">
        <md-outlined-text-field type="text" placeholder="Search Song" className="input-class w-full" label="Search Song" value={formState.searchSong} onChange={(e) => formDispatch({ type: 'SET_SEARCH_SONG', payload: e.target.value })} />
        {formState.selectedSongs.map((song, index) => (
          <SongChip key={index} artist={song} onDelete={() => handleDeleteSong(index)} />
        ))}
      </div>
{/* 
      <div className="relative">
        <md-outlined-text-field 
          type="text" 
          placeholder="Artist" 
          className="input-class w-full" 
          value={formState.artist} 
          onChange={(e) => {
            formDispatch({ type: 'SET_ARTIST', payload: e.target.value });
            debouncedSearchArtist();
          }}
        />
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-[--md-sys-color-surface] border border-[--md-sys-color-outline] rounded-md shadow-lg">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-[--md-sys-color-surface-variant] cursor-pointer"
                onClick={() => handleSelectArtist(result.name)}
              >
                {result.name}
              </div>
            ))}
          </div>
        )}
      </div> */}
      <FilledButton type="submit" className="" onClick={() => {}}>
        Save
      </FilledButton> 
      {/* Add more album-specific fields here */}
    </form>
  );
}