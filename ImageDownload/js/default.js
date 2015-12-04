// Eine Einführung zur leeren Vorlage finden Sie in der folgenden Dokumentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
	"use strict";

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;

	var loadImageUrl = function (url) {
	    return new Promise(function (resolve, reject) {
	        var image = new Image();
	        image.onload = function () {
	            resolve(image);
	        }
	        image.onerror = function (err) {
	            reject(err);
	        }
	        image.src = url;
	    });
	};

	var saveIntoCache = function (url, folder, filename) {
	    var uri = new Windows.Foundation.Uri(url);
	    var client = new Windows.Web.Http.HttpClient();
	    return client.getInputStreamAsync(uri)
        .then(function (input) {
            return folder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (file) {
                return file.openAsync(Windows.Storage.FileAccessMode.readWrite)
                .then(function (output) {
                    return Windows.Storage.Streams.RandomAccessStream.copyAsync(input, output).then(function () {
                        return output.flushAsync().then(function () {
                            input.close();
                            output.close();
                            return file;
                        });
                    })
                })
            })
        })
	}

	var retrieveUrlCacheAware = function (url) {
	    var cacheFolder = Windows.Storage.ApplicationData.current.localCacheFolder;
	    var filename = 'testaaaabbb';
	    return cacheFolder.getItemAsync(filename)
        .then(function (file) {
            return file;
        }, function() {
            return saveIntoCache(url, cacheFolder, filename);
        })
        .then(function (file) {
            return file.path;
        })
	}

	var getCachedImage = function (url) {
	    return retrieveUrlCacheAware(url)
        .then(function (cachedUrl) {
            console.log("CACHED", cachedUrl);
            return loadImageUrl(cachedUrl);
        })
	}


	app.onactivated = function (args) {
		if (args.detail.kind === activation.ActivationKind.launch) {
			if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
				// TODO: Diese Anwendung wurdh neu gestartet. Initialisieren Sie die Anwendung hier.
			} else {
				// TODO: Diese Anwendung wurde angehalten und dann beendet.
				// Um für ein nahtloses Benutzererlebnis zu sorgen, stellen Sie den Anwendungszustand hier wieder her, sodass es aussieht, als wäre die Ausführung der App nie beendet worden.
			}
			var promise = WinJS.UI.processAll().then(function () {
			    return getCachedImage("http://www.google.de/images/nav_logo242.png")
                .then(function (image) {
                    document.getElementById("img-container").appendChild(image);
                    console.log("SRC", image.src);
                }, function (err) {
                    console.log("HIER MANN", err);
                });
			});

			args.setPromise(promise);
		}
	};

	app.oncheckpoint = function (args) {
		// TODO: Diese Anwendung wird gleich angehalten. Speichern Sie hier alle Status, die über die das Anhalten hinaus beibehalten werden sollen.
		// Sie können das WinJS.Application.sessionState-Objekt verwenden, das automatisch gespeichert und über alle Anhaltevorgänge hinweg wiederhergestellt wird.
		// Wenn Sie vor dem Anhalten der Anwendung einen asynchronen Vorgang abschließen müssen, rufen Sie "args.setPromise()" auf.
	};

	app.start();
})();
