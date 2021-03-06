'use strict';

var container = require('../container');
var mocker = require('./mocker');
var sinon = require('sinon');
var assert = require('chai').assert;
var readSource = require('./test-utils/read-source');
var vsCodeFakeFactory = require('./test-utils/vscode-fake-factory');
var testUtils = require('./test-utils/test-utils');
var prettyJson = testUtils.prettyJson;

var approvalsConfig = require('./test-utils/approvalsConfig');
var approvals = require('approvals').configure(approvalsConfig).mocha('./test/approvals');

describe('Shift Params Left', function () {
    var subcontainer;
    var extractVariableFactory;
    var applySetEditSpy;

    beforeEach(function () {
        subcontainer = container.new();

        mocker.registerMock('logger');
        mocker.registerMock('editActionsFactory');

        subcontainer.register(mocker.getMock('logger').mock);
        subcontainer.register(mocker.getMock('editActionsFactory').mock);

        applySetEditSpy = sinon.spy();

        mocker.getMock('editActionsFactory').api.applySetEdit = function (text, coords) {
            applySetEditSpy(text, coords);

            return {
                then: function () { }
            };
        };

        mocker.getMock('logger').api.log = sinon.spy();
        mocker.getMock('logger').api.info = sinon.spy();
    });

    it('should log an error if selection is empty', function () {
        var sourceTokens = readSource('./test/fixtures/shiftParams/shiftParams.js');
        var vsCodeFake = vsCodeFakeFactory();
        var applySetEdit = mocker.getMock('editActionsFactory').api.applySetEdit;

        vsCodeFake.window.activeTextEditor._documentData._lines = sourceTokens;

        var info = mocker.getMock('logger').api.info;
        subcontainer.build('shiftParamsLeftFactory')(vsCodeFake.window.activeTextEditor, function () { })();

        this.verify(prettyJson(info.args));
    });

    it('should rotate params one to the left', function () {
        var sourceTokens = readSource('./test/fixtures/shiftParams/shiftParams.js');
        var vsCodeFake = vsCodeFakeFactory();
        var applySetEdit = mocker.getMock('editActionsFactory').api.applySetEdit;

        vsCodeFake.window.activeTextEditor._documentData._lines = sourceTokens;
        vsCodeFake.window.activeTextEditor._selections = [{
            _start: {
                _line: 2,
                _character: 14
            },
            _end: {
                _line: 2,
                _character: 21
            }
        }];

        subcontainer.build('shiftParamsLeftFactory')(vsCodeFake.window.activeTextEditor, function () { })();

        this.verify(prettyJson(applySetEditSpy.args));
    });


});