import httpClient from './httpClient';

export async function fetchNeighborhoodNames(): Promise<string[]> {
    const res = await httpClient.get('/api/sofiaplan/neighborhoods');
    if (!res.ok) throw new Error('Failed to fetch neighbourhoods');
    return res.json();
}
