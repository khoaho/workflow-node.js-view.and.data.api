
// global viewer variable
var _viewer;

///////////////////////////////////////////////////////////////////////////
// Add item to combobox
//
///////////////////////////////////////////////////////////////////////////
function addToCombo(modelName, modelURN) {

    var combo = document.getElementById("combo");
    var option = document.createElement("option");

    option.text = modelName;
    option.modelURN = modelURN;

    try {
        combo.add(option, null);
    }
    catch (error) {
        combo.add(option); // IE only
    }
}

///////////////////////////////////////////////////////////////////////////
// Model selected in combo event handler
//
///////////////////////////////////////////////////////////////////////////
function onModelSelected() {

    var combo = document.getElementById("combo");

    var urn = combo.options[combo.selectedIndex].modelURN;

    var viewerContainer = document.getElementById(
        'viewerElement');

    initializeViewer(
        getToken,
        viewerContainer,
        function (viewer) {

            _viewer = viewer;

            loadDocument(
                viewer,
                Autodesk.Viewing.Private.getAuthObject(),
                urn);
        });
}

///////////////////////////////////////////////////////////////////////////
// Get token callback
//
///////////////////////////////////////////////////////////////////////////
function getToken() {

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "http://" + window.location.host + '/nodeview/api/token', false);
    xmlHttp.send(null);

    var token = xmlHttp.responseText;

    return token;
}

///////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////
function initialize() {

    $.getJSON("http://" + window.location.host + '/nodeview/api/models', function (models) {

        models.forEach(function (model) {
            addToCombo(model.name, model.urn);
        });

        var urn = combo.options[0].modelURN;

        var viewerContainer = document.getElementById(
            'viewerElement');

        initializeViewer(
            getToken,
            viewerContainer,
            function (viewer) {

                _viewer = viewer;

                loadDocument(
                    viewer,
                    Autodesk.Viewing.Private.getAuthObject(),
                    urn);
            });
    });

    //zoom all on escape
    $(document).keyup(function (e) {
        // esc
        if (e.keyCode == 27) {
            zoomAll();
        }
    });
}

///////////////////////////////////////////////////////////////////////////
// Initialize the viewer
//
///////////////////////////////////////////////////////////////////////////
function initializeViewer(
    tokenCallback,
    viewerContainer,
    onViewerInitialized) {

    var options = {
        getAccessToken: tokenCallback,
        env: "AutodeskProduction"
    };

    var viewerDiv = document.getElementById('viewerDivId');

    if (viewerDiv) {
        viewerDiv.parentNode.removeChild(viewerDiv);
    }

    var newViewerDiv = document.createElement("div");

    newViewerDiv.id = 'viewerDivId';
    newViewerDiv.style.height = "100%";

    viewerContainer.appendChild(newViewerDiv);

    var viewer = new Autodesk.Viewing.Private.GuiViewer3D(
        newViewerDiv, {});

    Autodesk.Viewing.Initializer(options, function () {

        viewer.initialize();

        onViewerInitialized(viewer);
    });
}

///////////////////////////////////////////////////////////////////////////
// Load a document from urn
//
///////////////////////////////////////////////////////////////////////////
function loadDocument(viewer, auth, documentId) {

    if (documentId.indexOf('urn:') !== 0)
        documentId = 'urn:' + documentId;

    Autodesk.Viewing.Document.load(
        documentId,
        auth,
        function (document) {

            var items = Autodesk.Viewing.Document.getSubItemsWithProperties(
                document.getRootItem(),
                { 'type': 'geometry', 'role': '3d' },
                true);

            if (items.length > 0) {

                var item3d = document.getViewablePath(items[0]);

                viewer.load(item3d);

                viewer.addEventListener(
                    Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
                    onGeometryLoaded);
            }
        },
        function (msg) {

            AlertBox.displayError(
                document.getElementById('viewer3d'),
                "Load Error: " + msg);
        }
    );
}

///////////////////////////////////////////////////////////////////////////
// onGeometryLoaded callback
//
///////////////////////////////////////////////////////////////////////////
function onGeometryLoaded(event) {

    _viewer.removeEventListener(
        Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
        onGeometryLoaded);

    zoomAll(_viewer);
}

///////////////////////////////////////////////////////////////////////////
// Zoom on root component
//
///////////////////////////////////////////////////////////////////////////
function zoomAll(viewer) {

    viewer.getObjectTree(function (rootComponent) {

        viewer.docstructure.handleAction(
            ["focus"],
            rootComponent.dbId);
    });
}
