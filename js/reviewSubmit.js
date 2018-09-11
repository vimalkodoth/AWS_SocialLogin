module.exports = (function($,window){
    var AWSService = require('./aws/awsService.js');
    var socialMediaService = require('./socialLogin/socialMediaLogin.js');
    var Mediator = require('./common/mediator.js');
    var formValidator = require('./common/formValidator.js');
    require('./libs/profanityfilter.js');
    var fileUploaderDiv = $('#file-upload-drop'),
        button = fileUploaderDiv.find('input[type=button]'),
        loginToUploadDiv = $('#login-first'),
        droppedFile, fileName,
        fileElement = $('input[type=file]'),
        fileData = {},
        ratingMappings = {
            'awful' : 20,
            'ok' : 40,
            'good' : 60,
            'great' : 80,
            'awesome' : 100
        }, reviewQ = {}, formData ={};

    function handleSelectInput() {
        $('select').change(function (e) {
            $(this).prev('label').text(this.options[e.target.selectedIndex].text);
            formData[$(e.currentTarget).attr('data-id')] = this.options[e.target.selectedIndex].text;
        });
    }

    function handleTextAreaInput(){
        var profanityData = [];
        $.getJSON( "./js/json/profanity_en.json", function(data){
            profanityData = data;
        });
        $('textarea').keyup(function(e){
            formData[$(this).attr('data-id')]= $(this).val();
            $('.inputs_qa_section_2').profanityFilter({
                customSwears:profanityData,
                filter: true,
                replaceWith:"*"
            });
            if($(this).val()) {
                $(this).val(formValidator.xssFilterUnquotedTextInput($(this).val()) || '');
            }
        });
    }

    function handleFileInput(){
        console.log('subscribe');
        Mediator.subscribe('EVT_LOGIN', function(evt){
            console.log('received '+JSON.stringify(evt));
            if(evt.status) {
                loginToUploadDiv.hide();
                fileUploaderDiv.show();
                return;
            }
            loginToUploadDiv.show();
            fileUploaderDiv.hide();
        });
        //$.when(socialMediaService.isLoggedIn()).then(function(){
        //    console.log('logged in');
        //    loginToUploadDiv.hide();
        //    fileUploaderDiv.show();
        //},function(){
        //    console.log('not logged in');
        //    loginToUploadDiv.show();
        //    fileUploaderDiv.hide();
        //});
        //fileElement.on('change', function(e){
        //    fileData['file'] = this.files[0];
        //    fileData['type'] = this.files[0].type;
        //});
    }
    function handleTextInput(){
        $('input[type=text]').on('input', function(e){
            formData[$(this).attr('data-id')] = this.value;
        });
    }
    function handleRadioButtons(){
        $('input[type=radio]').change(function(){
            formData[$(this).attr('data-id')] = this.value === 'yes' ? true : false;
        })
    }
    function isDragDropSupported(){
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div) && 'FormData' in window && 'FileReader' in window;
    }

    function disableDefaultDragDrop(ele){
        ele.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
        })
    }

    function changeButtonDisplayFileName(ele, name){
        ele.val(name);
    }
    function processFile(file){
        var fileReader = new FileReader();
        fileReader.addEventListener("loadend", function() {
            $.when(AWSService.getRekognitionService().detectModerationLabels(fileReader.result)).then(function(data){
                console.log('[Succeed] Detect Moderation Labels '+ JSON.stringify(data));
                AWSService.getRekognitionService().detectLabels(fileReader.result).then(function(data){
                    console.log('Image verification succeeded!');
                    $("#file-processing").css('visibility','hidden');
                }, function(data){
                    console.log('Image verification failed!');
                    $("#file-processing").css('visibility','hidden');
                });
            },function(data){
                console.log('Image verification failed!');
                $("#file-processing").css('visibility','hidden');
            });
        });
        $("#file-processing").css('visibility','visible');
        fileReader.readAsArrayBuffer(file);
    }
    function handleBrowseInput(ele){
        ele.change(function(e){
            var fileReader = new FileReader();
            fileData['file'] = this.files[0];
            fileData['type'] = this.files[0].type;
            processFile(e.originalEvent.target.files[0]);
            //fileName = e.originalEvent.target.files[0].name;
            //changeButtonDisplayFileName(button, fileName);
            //fileReader.addEventListener("loadend", function() {
            //    $.when(AWSService.getRekognitionService().detectModerationLabels(fileReader.result)).then(function(data){
            //        console.log('[Succeed] Detect Moderation Labels '+ JSON.stringify(data));
            //        AWSService.getRekognitionService().detectLabels(fileReader.result).then(function(data){
            //            console.log('Detect Labels '+ JSON.stringify(data));
            //        });
            //    }, function(data){
            //        console.log('[Failed] Detect Moderation Labels '+ JSON.stringify(data));
            //        AWSService.getRekognitionService().detectLabels(fileReader.result).then(function(data){
            //            console.log('Detect Labels '+ JSON.stringify(data));
            //        });
            //    });
            //});
            //fileReader.readAsArrayBuffer(e.originalEvent.target.files[0]);
        })
    }
    function setReviewRating(e, value){
        reviewQ[$(e.currentTarget).attr('data-id')] = value;
        $(e.currentTarget).attr('data-percent',value);
    }
    function reviewRating() {
        var ratingElements = $('div[data-id]');
        ratingElements.click(function (e) {
            setReviewRating(e, ratingMappings[$(e.originalEvent.target).attr('title')]);

            e.preventDefault();
            e.stopPropagation();
        })
    }
    function dragAndDropFile(){
        if(isDragDropSupported()){
            disableDefaultDragDrop(fileUploaderDiv);
            fileUploaderDiv.on('drop',function(e){
                droppedFile = e.originalEvent.dataTransfer.files[0];
                //changeButtonDisplayFileName(button,droppedFile[0].name);
                processFile(droppedFile);
            });
        } else {
            console.log('Drag & Drop is not supported!');

        }
    }
    function handleFormSubmit(){
        $('#form-submit').on('click', function(){
            formData.reviewQ = reviewQ;
            formData.fileData = fileData;
            console.log('Data for server ...');
            console.log(formData);
            var formDat
        })
    }
    (function () {
        reviewRating();
        dragAndDropFile();
        handleBrowseInput(fileElement);
        handleSelectInput();
        handleTextAreaInput();
        handleRadioButtons();
        handleTextInput();
        handleFormSubmit();
        handleFileInput();
    })();

    return {

    };
})(jQuery, window);