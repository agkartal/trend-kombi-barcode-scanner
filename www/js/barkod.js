//https://cordova.apache.org/docs/en/latest/guide/cli/
//https://www.npmjs.com/package/phonegap-plugin-barcodescanner
var barkodOptions = {
    preferFrontCamera : false, // iOS and Android
    showFlipCameraButton : true, // iOS and Android
    showTorchButton : true, // iOS and Android
    torchOn: true, // Android, launch with the torch switched on (if available)
    saveHistory: true, // Android, save scan history (default false)
    prompt : "Place a barcode inside the scan area", // Android
    resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
    //formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
    orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
    disableAnimations : true, // iOS
    disableSuccessBeep: false // iOS and Android
};

var model = {
    kargoBarkodNo: "0",
    urunBarkodNo: "0",
    dosyaAdi: "0_0.jpg",
    originalFilePath: ""
}

function kargoBarkodOkut() {
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            document.getElementById("kargoBarkodText").innerHTML = "Kargo Barkod No: " + result.text;
            model.kargoBarkodNo = result.text;
            updateDosyaAdi();
        },
        function (error) {
            document.getElementById("kargoBarkodText").innerHTML = error;
        },
        barkodOptions
     );
}

function urunBarkodOkut() {
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            document.getElementById("urunBarkodText").innerHTML = "Ürün Barkod No: " + result.text;
            model.urunBarkodNo = result.text;
            updateDosyaAdi();
        },
        function (error) {
            document.getElementById("urunBarkodText").innerHTML = error;
        },
        barkodOptions
     );
}

function updateDosyaAdi() {
    model.dosyaAdi = model.kargoBarkodNo + "_" + model.urunBarkodNo;
    document.getElementById("dosyaAdi").innerHTML = model.dosyaAdi;
}

//https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-camera/
function kameraAc() {
    navigator.camera.getPicture(onGetPictureSuccess, onGetPictureFail, {
        destinationType: Camera.DestinationType.FILE_URI,
        // popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY, 300, 600),
        correctOrientation: true
    });
}

// file:///storage/emulated/0/Android/data/com.trendkombi.barcode/cache/1564868232964.jpg
function onGetPictureSuccess(result) {
    model.originalFilePath = result;
    document.getElementById("image").style.display = 'inline';
    document.getElementById("image").src = model.originalFilePath;
    console.log("Camera cleanup success.");
}

function onGetPictureFail(message) {
    alert('Failed because: ' + message);
}

function uploadFile() {
    var fileExtension = model.originalFilePath.split('.').pop();
    var newFileName = model.dosyaAdi + "." + fileExtension;
    renameFile(model.originalFilePath, newFileName);
}

function renameFile(originalFileNameWithPath, newFileName) {

    window.resolveLocalFileSystemURL(originalFileNameWithPath, function (fileEntry) {

        //window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(rootDirEntry) { // SD Kart için bu satır
        window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory, function (rootDirEntry) { // data/com.trendkombi.barcode/ için bu satır
            var trendKombiFolder = "TREND_KOMBI";
            rootDirEntry.getDirectory(trendKombiFolder, { create: true }, function (trendKombiDirEntry) {
                var trendKombiDateFolder = getTodayDateFormatted();
                trendKombiDirEntry.getDirectory(trendKombiDateFolder, { create: true }, function (trendKombiDateDirEntry) {
                    console.log(trendKombiDateFolder + " klasörü oluşturuldu." + trendKombiDateDirEntry);
                    fileEntry.moveTo(trendKombiDateDirEntry, newFileName, renameSuccess, renameFail);
                }, function(error) {
                    console.log("Klasör oluşturulamadı. Hata Kodu = " + error.code);
                    alert("Klasör oluşturulamadı. Sistem yöneticinize başvurun." + error.code);
                });
            });
        });     
    }, renameFail);
}

//and the sample success function
function renameSuccess(result) {
    alert("Resim " + result.nativeURL + " klasörüne yüklendi.");
    clearScreen();
    console.log(result);
}

//and the sample fail function
function renameFail(errorMessage) {
    console.log(errorMessage);
    alert('failed');
}

function clearScreen() {
    model = {
        kargoBarkodNo: "0",
        urunBarkodNo: "0",
        dosyaAdi: "0_0.jpg",
        originalFilePath: ""
    };

    document.getElementById("kargoBarkodText").innerHTML = "Kargo Barkod No: ";
    document.getElementById("urunBarkodText").innerHTML = "Ürün Barkod No: ";
    document.getElementById("dosyaAdi").innerHTML = "Resim Adı: ";
    document.getElementById("image").style.display = 'none';
    updateDosyaAdi();
}

function getTodayDateFormatted() {
    var d = new Date();
    var datestring = d.getFullYear() + ("0"+(d.getMonth()+1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    return datestring;
}