# Hearing
Users of your interface may be deaf or hard of hearing, or they might be operating in loud or public settings.

**Support text-based methods for experiencing audio and video.** It is crucial that essential information or dialogue within your app or game is not conveyed solely through sound. Depending on the context, provide users with different text-based ways to experience their media and allow them to customize how that text is displayed visually:

- **Captions** provide the written equivalent of audible information found in video or audio-only content. Captions are ideal for scenarios like game cutscenes and video clips where the text synchronizes live with the media.
- **Subtitles** enable users to read on-screen dialogue in their chosen language. Subtitles are best suited for television programs and movies.
- **Audio descriptions** are inserted during natural pauses in the primary audio track of a video to provide spoken narration regarding important information that is conveyed only visually.
- **Transcripts** offer a complete textual account of a video, covering both the audible and visual information. Transcripts are valuable for longer-form media such as podcasts and audiobooks where users may wish to review the content holistically or highlight sections while it plays.

For developer instructions, refer to [Selecting subtitles and alternative audio tracks](apple:AVFoundation/selecting-subtitles-and-alternative-audio-tracks).

- **Pair haptics with audio cues.** If your interface communicates information using auditory signals—such as a success chime, an error sound, or game feedback—consider pairing that sound with corresponding haptic vibrations for users who cannot perceive the audio or have it muted. In iOS and iPadOS, you can also utilize [Music Haptics](apple:MediaAccessibility/music-haptics) and [Audio graphs](apple:Accessibility/audio-graphs) to allow users to experience music and infographics through vibration and texture. For detailed guidance, consult **Playing haptics**.
- **Enhance audio cues with visual indicators.** This is particularly important for games and spatial applications where critical content may be occurring outside the screen view. When using audio to direct users toward a specific action, also include visual cues that indicate the required point of interaction.
