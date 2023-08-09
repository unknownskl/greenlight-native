pcap_video:
	ffmpeg -i video.pcap.mp4 -vcodec libx264 ./video.mp4

pcap_video_play:
	ffplay video.pcap.mp4

pcap_video_probe:
	ffprobe -of compact -show_entries frame=key_frame,pkt_pts_time,pict_type video.pcap.mp4

pcap_video_trace:
	ffmpeg -v trace -i video.pcap.mp4

pcap_video_frames:
	rm -rf frames && mkdir frames
	ffmpeg -i video.pcap.mp4 -vsync vfr -frame_pts true frames/out-%01d.jpeg


pcap_audio:
	ffmpeg -i audio.pcap.opus -f f32le


# video_test:
# 	ffmpeg -i client-poc/video.mp4 -vcodec libx264 ./video.mp4
# 	#ffmpeg -err_detect ignore_err -i client-poc/video.mp4 -c copy ./video_fixed.mkv -c:v libx264

# video_trace:
# 	ffmpeg -v trace -i client-poc/video.mp4