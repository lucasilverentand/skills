# AirPlay — full guidelines

### Best practices
- **Prefer the system-provided media player.** The native media player offers a standard control set and supports features such as chapter navigation, subtitles, closed captioning, and AirPlay transmission. It is also straightforward to implement, ensures a consistent and familiar playback experience across the system, and accommodates the requirements of most media applications. Only consider developing a custom video player if the system-provided player fails to meet your application's specific needs. For guidance on implementation, refer to [AVPlayerViewController](apple:AVKit/AVPlayerViewController).
- **Provide content in the highest possible resolution.** Your [HTTP Live Streaming](apple:http-live-streaming) (HLS) playlist must include the full spectrum of available resolutions so that users can experience your content in a resolution appropriate for their device (AVFoundation automatically selects the optimal resolution based on the hardware). If you omit a range of resolutions, your content will appear low quality when streamed to a device capable of higher fidelity. For instance, content that looks excellent on an iPhone at 720p will appear compromised when streamed via AirPlay to a 4K television.
- **Stream only the content people expect.** Avoid streaming materials like background loops or short video experiences that are only meaningful within the application's context. For developer guidance, consult [usesExternalPlaybackWhileExternalScreenIsActive](apple:AVFoundation/AVPlayer/usesExternalPlaybackWhileExternalScreenIsActive).
- **Support both AirPlay streaming and mirroring.** Offering support for both features provides users with maximum flexibility.
- **Support remote control events.** When implemented, this allows users to select actions like play, pause, and fast forward using the lock screen, or through interaction with Siri or HomePod. For developer guidance, see [Remote command center events](apple:MediaPlayer/remote-command-center-events).
- **Don’t stop playback when your app enters the background or when the device locks.** For example, users expect a TV show they began streaming from your app to continue playing while they check email or put their device to sleep. In this scenario, it is also critical to prevent automatic mirroring, as users should not be unknowingly streaming content on their device.
- **Don’t interrupt another app’s playback unless your app is starting to play immersive content.** For instance, if your application plays a video upon launch or auto-plays inline videos, play this content only on the local device while allowing any currently playing media to continue uninterrupted. For developer guidance, see [ambient](apple:AVFAudio/AVAudioSession/Category-swift.struct/ambient).
- **Let people use other parts of your app during playback.** While AirPlay is active, your application must remain fully functional. If users navigate away from the playback screen, ensure that other in-app videos do not begin playing and disrupt the streamed content.
- **If necessary, provide a custom interface for controlling media playback.** If you cannot utilize the system-provided media player, you may create a custom media player that offers users an intuitive method to initiate AirPlay. If this is required, ensure you supply custom controls that mirror the appearance and behavior of the system-provided ones, including distinct visual states indicating when playback has started, is in progress, or is unavailable. Use only symbols provided by Apple in custom controls that initiate AirPlay, and position the AirPlay icon correctly within your custom player—specifically in the lower-right corner (for iOS 16, iPadOS 16 and later).

### Using AirPlay icons
AirPlay icons are available for download in [Resources](https://developer.apple.com/design/resources/). The following options outline how you can display the AirPlay icon within your application.

#### Black AirPlay icon
When other technology icons are rendered in black, display the AirPlay icon in black when placed on a white or light background.

#### White AirPlay icon
When other technology icons are also rendered in white, display the white AirPlay icon against black or dark backgrounds.

#### Custom color AirPlay icon
Apply a custom color when other technology icons share the same coloring scheme.

- **Ensure the AirPlay icon is positioned identically to other technology icons.** If you enclose other technology icons within shapes, the AirPlay icon may also be displayed similarly.
- **Do not incorporate the AirPlay icon or name into custom buttons or interactive components.** The icon and the term *AirPlay* should only appear in non-interactive contexts.

**Accurately pair the icon with the name *AirPlay*.** If you are referencing other technologies in a similar manner, you may place the name either beneath or adjacent to the icon. Use the same typeface used throughout your design. Do not embed the AirPlay icon within text or use it as a substitute for the name *AirPlay*.

**Prioritize your application over AirPlay.** Ensure that references to AirPlay are less visually dominant than your app's name or primary identity.

### Referring to AirPlay
**Ensure proper capitalization when referring to *AirPlay*.** *AirPlay* is a single word, beginning with uppercase *A* and uppercase *P*, followed by lowercase letters. If your design environment only utilizes all-uppercase designations, you may render *AirPlay* entirely in uppercase to align with the surrounding style.

**Always treat *AirPlay* as a noun.**

||Example text|
|---|---|
|✓|Use AirPlay to listen on your speaker|
|✗|AirPlay to your speaker|
|✗|You can AirPlay with [App Name]|

**Employ phrasing such as *works with*, *use*, *supports*, and *compatible*.**

||Example text|
|---|---|
|✓|[App Name] is compatible with AirPlay|
|✓|AirPlay-enabled speaker|
|✓|You can use AirPlay with [App Name]|
|✗|[App Name] has AirPlay|

**Include the name *Apple* alongside *AirPlay* when contextually appropriate.**

||Example text|
|---|---|
|✓|Compatible with Apple AirPlay|

**Mention AirPlay when necessary to enhance clarity.** If your content pertains specifically to AirPlay, you may use the term to establish this. Additionally, referencing AirPlay is acceptable within technical specifications.

||Example text|
|---|---|
|✓|[App Name] now supports AirPlay|
