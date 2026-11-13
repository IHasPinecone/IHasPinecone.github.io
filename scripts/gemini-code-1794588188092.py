# Request up to 5 results instead of just 1 to check for studio albums
query = f"{name} {artist}"
url = f"https://itunes.apple.com/search?term={requests.utils.quote(query)}&media=music&entity=song&limit=5"

try:
    res = requests.get(url, timeout=10)
    data = res.json()
    
    if data.get('resultCount', 0) > 0:
        selected_track = None
        
        # Words to avoid in album titles
        skip_keywords = ['greatest hits', 'best of', 'anthology', 'collection', 'platinum', 'gold', 'live', 'ultimate', 'essentials']
        
        # Loop through results to find the first non-compilation studio album
        for track in data['results']:
            album_name = track.get('collectionName', '').lower()
            
            # Check if any compilation keyword is in the album name
            is_compilation = any(keyword in album_name for keyword in skip_keywords)
            
            if not is_compilation:
                selected_track = track
                break # Found our original studio album!
        
        # Fallback: if all 5 results are compilations, just take the first result anyway
        if not selected_track:
            selected_track = data['results'][0]
        
        # 1. Autofill Cover Art from the selected studio track
        if not has_cover:
            artwork_url_100 = selected_track.get('artworkUrl100')
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
                    print(f"Autofilled studio cover for {name} ({selected_track.get('collectionName')}) -> {song['cover']}")
        
        # 2. Autofill Release Year (this will now naturally pull the original studio release year)
        if not has_year:
            release_date = selected_track.get('releaseDate')
            if release_date:
                year = release_date[:4]
                song['release_year'] = year
                updated = True
                print(f"Autofilled original release year {year} for {name}")
                
        # 3. Autofill Preview URL
        if not has_preview:
            preview_url = selected_track.get('previewUrl')
            if preview_url:
                song['preview_url'] = preview_url
                updated = True