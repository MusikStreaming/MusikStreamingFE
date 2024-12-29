'use client'

interface SearchFilterChipsProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  counts: {
    albums: number;
    songs: number;
    artists: number;
    users: number;
  };
}

function FilterChip({ 
  label, 
  selected, 
  onClick 
}: { 
  label: string; 
  selected: boolean; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium
        transition-colors duration-200
        ${selected ? 
          'bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary]' : 
          'bg-[--md-sys-color-surface-container-high] text-[--md-sys-color-on-surface] hover:bg-[--md-sys-color-surface-container-highest]'
        }
      `}
    >
      {label}
    </button>
  );
}

export default function SearchFilterChips({ selectedFilter, onFilterChange, counts }: SearchFilterChipsProps) {
  const totalCount = counts.albums + counts.songs + counts.artists + counts.users;
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide hover:scrollbar-default">
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          height: 4px;
          display: none;
        }
        
        .scrollbar-hide:hover::-webkit-scrollbar {
          display: block;
        }

        .scrollbar-hide::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-hide::-webkit-scrollbar-thumb {
          background: var(--md-sys-color-outline-variant);
          border-radius: 2px;
        }

        .scrollbar-hide::-webkit-scrollbar-button {
          display: none;
        }

        .scrollbar-hide {
          scrollbar-width: thin;
          scrollbar-color: var(--md-sys-color-outline-variant) transparent;
        }
      `}</style>
      <FilterChip 
        label={`All (${totalCount})`}
        selected={selectedFilter === 'all'}
        onClick={() => onFilterChange('all')}
      />
      {counts.albums > 0 && (
        <FilterChip
          label={`Albums (${counts.albums})`}
          selected={selectedFilter === 'albums'}
          onClick={() => onFilterChange('albums')}
        />
      )}
      {counts.songs > 0 && (
        <FilterChip
          label={`Songs (${counts.songs})`}
          selected={selectedFilter === 'songs'}
          onClick={() => onFilterChange('songs')}
        />
      )}
      {counts.artists > 0 && (
        <FilterChip
          label={`Artists (${counts.artists})`}
          selected={selectedFilter === 'artists'}
          onClick={() => onFilterChange('artists')}
        />
      )}
      {counts.users > 0 && (
        <FilterChip
          label={`Users (${counts.users})`}
          selected={selectedFilter === 'users'}
          onClick={() => onFilterChange('users')}
        />
      )}
    </div>
  );
}
