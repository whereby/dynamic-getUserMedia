(async function () {
    /* behaviour is controlled via sessionStorage. Remember it stores JSON...
    sessionStorage.__getUserMediaAudioError = "NotAllowedError";
    sessionStorage.__getUserMediaVideoError = "NotFoundError";
    sessionStorage.__filterAudioDevices = true;
    sessionStorage.__filterVideoDevices = true;
    sessionStorage.__filterDeviceLabels = true;
    */

    // override getUserMedia to inject errors.
    const origGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
        navigator.mediaDevices,
    );
    navigator.mediaDevices.getUserMedia = async (constraints) => {
        let err;

        // for consistency with the device modifications reject with a NotFoundError.
        if (constraints.audio && sessionStorage.__filterAudioDevices) {
            err = new Error("getUserMedia error");
            err.name = "NotFoundError";
            return Promise.reject(err);
        }

        var isScreenSharing =
            constraints.video &&
            (constraints.video.mediaSource ||
                (constraints.video.mandatory &&
                    constraints.video.mandatory.chromeMediaSource));
        if (
            constraints.video &&
            sessionStorage.__filterVideoDevices &&
            !isScreenSharing
        ) {
            err = new Error("getUserMedia error");
            err.name = "NotFoundError";
            return Promise.reject(err);
        }

        // return errors
        if (constraints.audio && sessionStorage.__getUserMediaAudioError) {
            err = new Error("getUserMedia error");
            err.name = sessionStorage.__getUserMediaAudioError;
            return Promise.reject(err);
        }
        if (constraints.video && sessionStorage.__getUserMediaVideoError) {
            err = new Error("getUserMedia error");
            err.name = sessionStorage.__getUserMediaVideoError;
            return Promise.reject(err);
        }

        function isFakeDeviceId(deviceId) {
            if (typeof deviceId === "string") {
                return deviceId.indexOf("dynamicGum:fake:") === 0;
            } else if (deviceId?.ideal) {
                return deviceId.ideal.indexOf("dynamicGum:fake:") === 0;
            }
            return false;
        }
        if (constraints.video?.deviceId) {
            const deviceId = constraints.video.deviceId;
            if (
                (deviceId.exact && isFakeDeviceId(deviceId.exact)) ||
                isFakeDeviceId(deviceId)
            ) {
                const canvas = document.createElement("canvas");
                canvas.width = 640; // TODO: actual width/height.
                canvas.height = 480;
                const ctx = canvas.getContext("2d", { alpha: false });
                ctx.fillStyle = (
                    constraints.video.deviceId.exact
                        ? constraints.video.deviceId.exact
                        : constraints.video.deviceId
                ).substr(16);
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const videoStream = canvas.captureStream();
                const videoTrack = videoStream.getVideoTracks()[0];
                delete constraints.video;
                const stream = await origGetUserMedia(constraints);
                stream.addTrack(videoTrack);
                return stream;
            }
        }
        return origGetUserMedia(constraints);
    };

    // override enumerateDevices to filter certain device kinds or return empty labels
    // (which means no permission has been granted). Also returns empty labels
    // and device ids when getUserMedia permission is denied via a session storage flag.
    const origEnumerateDevices = navigator.mediaDevices.enumerateDevices.bind(
        navigator.mediaDevices,
    );
    navigator.mediaDevices.enumerateDevices = async () => {
        let devices = await origEnumerateDevices();
        if (sessionStorage.__filterVideoDevices) {
            devices = devices.filter((device) => device.kind !== "videoinput");
        }
        if (sessionStorage.__filterAudioDevices) {
            devices = devices.filter((device) => device.kind !== "audioinput");
        }

        devices = devices.map((device) => {
            const deviceWithoutLabelAndDeviceId = {
                deviceId: "",
                kind: device.kind,
                label: "",
                groupId: device.groupId,
            };

            if (
                device.kind === "audioinput" &&
                sessionStorage.__getUserMediaAudioError === "NotAllowedError"
            ) {
                return deviceWithoutLabelAndDeviceId;
            }

            if (
                device.kind === "videoinput" &&
                sessionStorage.__getUserMediaVideoError === "NotAllowedError"
            ) {
                return deviceWithoutLabelAndDeviceId;
            }

            if (sessionStorage.__filterDeviceLabels) {
                return deviceWithoutLabelAndDeviceId;
            }

            return device;
        });
        if (sessionStorage.__fakeVideoDevices) {
            JSON.parse(sessionStorage.__fakeVideoDevices).forEach(
                function (fakeDeviceSpec) {
                    devices.push({
                        deviceId: "dynamicGum:fake:" + fakeDeviceSpec.color,
                        kind: "videoinput",
                        label: fakeDeviceSpec.label,
                        groupId: "fake devices",
                    });
                },
            );
        }
        return devices;
    };

    // override addEventListener in order to allow injection of synthetic events using `fakeEmit`.
    var __eventListeners = {};
    var origAddEventListener = navigator.mediaDevices.addEventListener.bind(
        navigator.mediaDevices,
    );
    navigator.mediaDevices.addEventListener = function (name, handler) {
        if (!__eventListeners[name]) {
            __eventListeners[name] = [];
        }
        __eventListeners[name].push(handler);
        return origAddEventListener(name, handler);
    };

    navigator.mediaDevices.fakeEmit = function (name, event) {
        if (!__eventListeners[name]) {
            return;
        }
        __eventListeners[name].forEach(function (listener) {
            listener(event);
        });
    };
})();
