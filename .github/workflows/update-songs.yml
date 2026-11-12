import json
import os
import requests
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def main():
    json_path = 'songs.json'
    if not os.path.exists(json_path):
        print("songs.json not found.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        songs = json.load(f)

    os.makedirs('songs', exist_ok=True)
    updated = False

    for song in songs:
        name = song.get('name')
        artist = song.get('artist')
        
        # Check if fields are already manually specified
        has_cover = bool(song.get('cover'))
        has_year = bool(song.get('release_year'))
        has_preview = bool(song.get('preview_url'))
        
        if has_cover and has_year and has_preview:
            print(f"Skipping API fetch for {name} - {artist} (all fields manually provided)")
            continue

        # Query iTunes Search API for missing fields
        query = f"{name} {artist}"
        url = f"https://itunes.apple.com/search?term={requests.utils.quote(query)}&media=music&entity=song&limit=1"
        
        try:
            res = requests.get(url, timeout=10)
            data = res.json()
            
            if data.get('resultCount', 0) > 0:
                track = data['results'][0]
                
                # 1. Autofill Cover Art if missing
                if not has_cover:
                    artwork_url_100 = track.get('artworkUrl100')
                    if artwork_url_100:
                        artwork_url_600 = artwork_url_100.replace('100x100bb', '600x600bb')
                        slug = f"{slugify(artist)}-{slugify(name)}.jpg"
                        cover_path = os.path.join('songs', slug)
                        
                        img_res = requests.get(artwork_url_600, timeout=10)
                        if img_res.status_code == 200:
                            with open(cover_path, 'wb') as img_f:
                                img_f.write(img_res.content)
                            song['cover'] = f"songs/{slug}"
                            updated = True
                            print(f"Autofilled cover for {name} -> {song['cover']}")
                
                # 2. Autofill Release Year if missing
                if not has_year:
                    release_date = track.get('releaseDate')
                    if release_date:
                        year = release_date[:4]
                        song['release_year'] = year
                        updated = True
                        print(f"Autofilled release year {year} for {name}")
                        
                # 3. Autofill Preview URL if missing
                if not has_preview:
                    preview_url = track.get('previewUrl')
                    if preview_url:
                        song['preview_url'] = preview_url
                        updated = True
                        print(f"Autofilled preview URL for {name}")

        except Exception as e:
            print(f"Error fetching data for {name} - {artist}: {e}")

    if updated:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(songs, f, indent=2)
        print("songs.json successfully updated.")
    else:
        print("No updates needed.")

if __name__ == '__main__':
    main()
