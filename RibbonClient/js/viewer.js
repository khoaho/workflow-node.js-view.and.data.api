
//globals
var _auth;
var _viewer;

///////////////////////////////////////////////////////////////////////////
// Clear current model
//
///////////////////////////////////////////////////////////////////////////
function clearCurrentModel() {

    $('#jstree').empty();
    $("#jstree").jstree("destroy");

    var viewerElement = document.getElementById('viewer3d');

    if (viewerElement) {
        viewerElement.parentNode.removeChild(viewerElement);
    }
}

///////////////////////////////////////////////////////////////////////////
// Get all leaf component in model structure
//
///////////////////////////////////////////////////////////////////////////
function getAllLeafComponents(viewer, callback) {

    function getLeafComponentsRec(parent) {

        var components = [];

        if (typeof parent.children !== "undefined") {

            var children = parent.children;

            for (var i = 0; i < children.length; i++) {

                var child = children[i];

                if (typeof child.children !== "undefined") {

                    var subComps = getLeafComponentsRec(child);

                    components.push.apply(components, subComps);
                }
                else {
                    components.push(child);
                }
            }
        }

        return components;
    }

    viewer.getObjectTree(function (result) {

        var allLeafComponents = getLeafComponentsRec(result);

        callback(allLeafComponents);
    });
}

///////////////////////////////////////////////////////////////////////////
// Populate Tree with components
//
///////////////////////////////////////////////////////////////////////////
function populateTree(viewer) {

    $('#jstree').jstree({

        'core': {
            check_callback: true
        }
    });

    $('#jstree').on("ready.jstree",
        function (e, data) {

            var treeRef = $('#jstree').jstree(true);

            _viewer.getObjectTree(function (rootComponent) {

                var rootNode = createNode(
                    treeRef,
                    '#',
                    rootComponent);

                buildTreeRec(treeRef, rootNode, rootComponent);

                $('#jstree').jstree("open_node", rootNode);
            });
        });

    $("#jstree").on("select_node.jstree",
        function (event, data) {

            var node = data.node;


        });

    $("#jstree").on("dblclick.jstree",
        function (event) {

            var ids = $('#jstree').jstree('get_selected');

            var selectedId = parseInt(ids[0]);

            displayComponentInfo(selectedId);

            _viewer.isolateById(selectedId);
            _viewer.docstructure.handleAction(["focus"], selectedId);
        });

    function createNode(tree, parentNode, component) {

        var icon = (component.children ?
            './resources/parent.png' :
            './resources/child.png');

        var nodeData = {
            'text': component.name,
            'id': component.dbId,
            'icon': icon
        };

        var node = tree.create_node(
            parentNode,
            nodeData,
            'last',
            false,
            false);

        return node;
    }

    function buildTreeRec(tree, parentNode, component) {

        if (component.children) {

            var children = component.children;

            for (var i = 0; i < children.length; i++) {

                var childComponent = children[i];

                var childNode = createNode(
                    tree,
                    parentNode,
                    childComponent);

                if (childComponent.children) {

                    buildTreeRec(tree, childNode, childComponent);
                }
            }
        }
    }
}

///////////////////////////////////////////////////////////////////////////
// Loads a document
//
///////////////////////////////////////////////////////////////////////////
function loadDocument(auth, viewer, documentId) {

    if (documentId.indexOf('urn:') !== 0)
        documentId = 'urn:' + documentId;

    Autodesk.Viewing.Document.load(
        documentId,
        auth,
        function (viewerDoc) {

            var items = Autodesk.Viewing.Document.getSubItemsWithProperties(
                viewerDoc.getRootItem(),
                { 'type': 'geometry', 'role': '3d' },
                true);

            if (items.length > 0) {

                var item3d = viewerDoc.getViewablePath(items[0]);

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
// Create viewer 
//
///////////////////////////////////////////////////////////////////////////
function createViewer() {

    var viewerContainer = document.getElementById('ViewerDiv');

    var viewerElement = document.createElement("div");

    viewerElement.id = 'viewer3d';
    viewerElement.style.height = "100%";

    viewerContainer.appendChild(viewerElement);

    var viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {});

    viewer.initialize();

    viewer.addEventListener('selection', onViewerItemSelected);

    // disable scrolling on DOM document 
    // while mouse pointer is over viewer area
    $('#viewer3d').hover(
        function () {
            var scrollX = window.scrollX;
            var scrollY = window.scrollY;
            window.onscroll = function () {
                window.scrollTo(scrollX, scrollY);
            };
        },
        function () {
            window.onscroll = null;
        }
    );

    // disable default context menu on viewer div 
    viewerElement.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    return viewer;
}

///////////////////////////////////////////////////////////////////////////
// Geometry loaded event
//
///////////////////////////////////////////////////////////////////////////
function onGeometryLoaded(event) {

    _viewer.removeEventListener(
        Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
        onGeometryLoaded);

    populateTree();

    fitToWindow();
}

///////////////////////////////////////////////////////////////////////////
// Item selected in viewer callback
//
///////////////////////////////////////////////////////////////////////////
function onViewerItemSelected(event) {

    var dbIdArray = event.dbIdArray;

    for (var i = 0; i < dbIdArray.length; i++) {

        var dbId = dbIdArray[i];

    }
}

///////////////////////////////////////////////////////////////////////////
// Authenticate
//
///////////////////////////////////////////////////////////////////////////
function authenticate(accessToken) {

    var options = {};

    options.env = "AutodeskProduction";

    options.accessToken = accessToken;

    initializeEnvironmentVariable(options);
    initializeServiceEndPoints();

    return initializeAuth(null, options);
}

///////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////
function initializeViewer() {

    console.log("host: " + window.location.host);

    $.get("http://" + window.location.host + '/nodeview/api/token',
           function (accessToken) {
               
               console.log("Access Token: " + accessToken);

               _auth = authenticate(accessToken);
    
               var urn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YWRuLTMwLjA2LjIwMTQtMTEuMjUuNDUvdHJhaWxlci5kd2Y=';

               _viewer = createViewer();

               loadDocument(_auth, _viewer, urn);
           }
       );
   
    $(document).keyup(function (e) {

        // esc
        if (e.keyCode == 27) {

            fitToWindow();
        }
    });
}

function fitToWindow() {

    _viewer.getObjectTree(function (rootComponent) {

        _viewer.docstructure.handleAction(
            ["focus"],
            rootComponent.dbId);
    });
}