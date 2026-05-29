describe("enumerateDevices inject", () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it("filters audio devices when __filterAudioDevices is set", async () => {
        sessionStorage.__filterAudioDevices = true;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const kinds = devices.map((d) => d.kind);
        expect(kinds).not.toContain("audioinput");
    });

    it("filters video devices when __filterVideoDevices is set", async () => {
        sessionStorage.__filterVideoDevices = true;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const kinds = devices.map((d) => d.kind);
        expect(kinds).not.toContain("videoinput");
    });

    it("filters device labels when __filterDeviceLabels is set", async () => {
        sessionStorage.__filterDeviceLabels = true;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const nonEmptyLabels = devices.filter((d) => d.label !== "");
        expect(nonEmptyLabels).toHaveLength(0);
    });

    it("filters audio device labels when permission is denied", async () => {
        sessionStorage.__getUserMediaAudioError = "NotAllowedError";
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevicesWithLabels = devices.filter(
            (d) => d.kind === "audioinput" && d.label !== "",
        );
        expect(audioDevicesWithLabels).toHaveLength(0);
    });

    it("filters audio device ids when permission is denied (Chrome only)", async () => {
        sessionStorage.__getUserMediaAudioError = "NotAllowedError";
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevicesWithDeviceIds = devices.filter(
            (d) => d.kind === "audioinput" && d.deviceId !== "",
        );
        expect(audioDevicesWithDeviceIds).toHaveLength(0);
    });

    it("filters video device labels when permission is denied", async () => {
        sessionStorage.__getUserMediaVideoError = "NotAllowedError";
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevicesWithLabels = devices.filter(
            (d) => d.kind === "videoinput" && d.label !== "",
        );
        expect(videoDevicesWithLabels).toHaveLength(0);
    });

    it("filters video device ids when permission is denied", async () => {
        sessionStorage.__getUserMediaVideoError = "NotAllowedError";
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevicesWithDeviceIds = devices.filter(
            (d) => d.kind === "videoinput" && d.deviceId !== "",
        );
        expect(videoDevicesWithDeviceIds).toHaveLength(0);
    });
});
