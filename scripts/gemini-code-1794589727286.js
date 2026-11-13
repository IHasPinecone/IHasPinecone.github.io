const fs = require('fs');
const path = require('path');

// Simple slugify helper function
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');  // Replace multiple - with single -
}

async function updateSongs() {
    const jsonPath = path.join(__dirname, '..', 'songs.json');
    if (!fs.existsSync(jsonPath)) {
        console.log('songs.json not found.');
        return;
    }

    const songsData = fs.readFileSync(jsonPath, 'utf8');
    const songs = JSON.parse(songsData);
    let updated = false;

    const skipKeywords = ['greatest hits', 'best of', 'anthology', 'collection', 'platinum', 'gold', 'live', 'ultimate', 'essentials'];

    for (const song of songs) {
        const name = song.name;
        const artist = song.artist;
        
        const hasCover = Boolean(song.cover && fs.existsSync(path.join(__dirname, '..', song.cover)));
        const hasYear = Boolean(song.release_year);
        const hasPreview = Boolean(song.preview_url);

        if (hasCover && hasYear && hasPreview) {
            continue;
        }

        console.log(`Checking metadata for: ${name} by ${artist}`);
        const query = `${name} ${artist}`;
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=5`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.resultCount > 0) {
                let selectedTrack = null;

                // Find the first non-compilation studio album
                for (const track of data.results) {
                    const albumName = (track.collectionName || '').toLowerCase();
                    const isCompilation = skipKeywords.some(keyword => albumName.includes(keyword));

                    if (!isCompilation) {
                        selectedTrack = track;
                        break;
                    }
                }

                // Fallback to first result if all are compilations
                if (!selectedTrack) {
                    selectedTrack = data.results[0];
                }

                // 1. Autofill Cover Art
                if (!hasCover) {
                    const artworkUrl100 = selectedTrack.artworkUrl100;
                    if (artworkUrl100) {
                        const artworkUrl600 = artworkUrl100.replace('100x100bb', '600x600bb');
                        const slug = `${slugify(artist)}-{slugify(name)}.jpg`.replace('{slugify(name)}', slugify(name));
                        const coverDir = path.join(__dirname, '..', 'songs');
                        if (!fs.existsSync(coverDir)) {
                            fs.mkdirSync(coverDir, { recursive: true });
                        }
                        const coverPath = path.join(coverDir, slug);

                        const imgRes = await fetch(artworkUrl600);
                        if (imgRes.ok) {
                            const buffer = Buffer.from(await imgRes.arrayBuffer());
                            fs.writeFileSync(coverPath, buffer);
                            song.cover = `songs/${slug}`;
                            updated = true;
                            console.log(`Autofilled studio cover for ${name} (${selectedTrack.collectionName}) -> ${song.cover}`);
                        }
                    }
                }

                // 2. Autofill Release Year
                if (!hasYear) {
                    const releaseDate = selectedTrack.releaseDate;
                    if (releaseDate) {
                        const year = releaseDate.slice(0, 4);
                        song.release_year = year;
                        updated = true;
                        console.log(`Autofilled original release year ${year} for ${name}`);
                    }
                }

                // 3. Autofill Preview URL
                if (!hasPreview) {
                    const previewUrl = selectedTrack.previewUrl;
                    if (previewUrl) {
                        song.preview_url = previewUrl;
                        updated = true;
                        console.log(`Autofilled preview URL for ${name}`);
                    }
                }
            }
        } catch (err) {
            console.error(`Error fetching metadata for ${name}:`, err);
        }
    }

    if (updated) {
        fs.writeFileSync(jsonPath, JSON.stringify(songs, null, 2) + '\n', 'utf8');
        console.log('songs.json successfully updated.');
    } else {
        console.log('No updates needed.');
    }
}

updateSongs();