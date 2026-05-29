describe("getUserMedia inject", () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it("returns the audio error when __getUserMediaAudioError is set", async () => {
        const errorName = "some error";
        sessionStorage.__getUserMediaAudioError = errorName;
        await expect(
            navigator.mediaDevices.getUserMedia({ audio: true }),
        ).rejects.toMatchObject({ name: errorName });
    });

    it("returns the video error when __getUserMediaVideoError is set", async () => {
        const errorName = "some error";
        sessionStorage.__getUserMediaVideoError = errorName;
        await expect(
            navigator.mediaDevices.getUserMedia({ video: true }),
        ).rejects.toMatchObject({ name: errorName });
    });

    it("returns NotFoundError when calling with audio:true and __filterAudioDevices is set", async () => {
        sessionStorage.__filterAudioDevices = 1;
        await expect(
            navigator.mediaDevices.getUserMedia({ audio: true }),
        ).rejects.toMatchObject({ name: "NotFoundError" });
    });

    it("returns NotFoundError when calling with video:true and __filterVideoDevices is set", async () => {
        sessionStorage.__filterVideoDevices = 1;
        await expect(
            navigator.mediaDevices.getUserMedia({ video: true }),
        ).rejects.toMatchObject({ name: "NotFoundError" });
    });
});
