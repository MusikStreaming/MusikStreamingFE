/**
 * @author @hungtran3011
 * @fileoverview Artist page
 * @filedescription This file contains the ArtistPage component which fetches and displays artist data based on the provided artist ID.
 * @module ArtistPage
 * @requires @/app/model/artist
 * @requires react
 * @requires @/app/api-fetch/artist-by-id
 */
import React from 'react'
import ArtistContent from './content';
import fetchArtistByIdServer from '@/app/api-fetch/artist-id-server';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const artist = await fetchArtistByIdServer(id);
    if (artist) {
        return {
            title: `${artist.name} on MusikStreaming`,
            description: artist.description,
        };
    }
    else {
        return {
            title: 'Artist not found',
            description: 'The artist you are looking for is not found',
        }
    }
}

/**
 * ArtistPage component fetches and displays artist data.
 * 
 * @param {Object} props - The component props.
 * @param {Object} props.params - The route parameters.
 * @param {string} props.params.id - The artist ID.
 * @returns {JSX.Element} The rendered component.
 * @throws {Error} Any error thrown by the fetchArtistById function.
 */
export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
    return <ArtistContent params={params} />;
}