(function() {
  var AuthDialog, ErrorContainer, ForgotPasswordPanel, Panel, SignInPanel, SignUpPanel, isEmail, isEmailRe,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  isEmailRe = /^[-a-z0-9!#$%&'*+/=?^_`{|}~]+(?:\.[-a-z0-9!#$%&'*+/=?^_`{|}~]+)*@(?:[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*(?:aero|arpa|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|[a-z][a-z])$/i;

  isEmail = function(str) {
    return isEmailRe.test(str);
  };

  Panel = (function() {
    /*
        базовая панель
    */
    function Panel(_errors, url) {
      var _base;
      this._errors = _errors;
      this._removeSubmitBtnActiveState = __bind(this._removeSubmitBtnActiveState, this);
      this._onSuccess = __bind(this._onSuccess, this);
      this._onError = __bind(this._onError, this);
      this._hideError = __bind(this._hideError, this);
      this._form = this._getForm();
      if (typeof (_base = this._form.find('input')).placeholder === "function") {
        _base.placeholder();
      }
      this._createNoRobotsField();
      this._submitBtn = null;
      this._successMsg = this._form.find(".js-success-msg");
      this._initAjaxForm();
      this._initNext(url);
    }

    Panel.prototype._initNext = function(url) {
      /*
              Заменяет на ссылках url для редиректа после авторизации
              @param url относительный url, должен начинаться со слеша
      */
      var _ref, _ref2;
      this._next = !url || !url.match(/^\//) ? '/topic/' : url;
      if ((_ref = this._form.find(".js-google-login-link")) != null) {
        _ref.attr('href', "" + (this._getUrlPrefix()) + "/auth/google/?url=" + (encodeURIComponent(this._next)));
      }
      return (_ref2 = this._form.find('.js-facebook-login-link')) != null ? _ref2.attr('href', "" + (this._getUrlPrefix()) + "/auth/facebook/?url=" + (encodeURIComponent(this._next))) : void 0;
    };

    Panel.prototype.setNext = function(url) {
      /*
              Устанавливает редирект после логина
      */      return this._initNext(url);
    };

    Panel.prototype.show = function() {
      /*
              действия при показывании панели
      */      this._hideError();
      this._showFormFields();
      this._hideSuccessMessage();
      return this._form.removeClass('hidden');
    };

    Panel.prototype.hide = function() {
      /*
              действия при скрывании панели
      */      return this._form.addClass('hidden');
    };

    Panel.prototype._createNoRobotsField = function() {
      return this._form.append('<input type="hidden" name="no_robots" value="no robots here"/>');
    };

    Panel.prototype._getForm = function() {
      /*
              контейнер формы
      */      return null;
    };

    Panel.prototype._initAjaxForm = function() {
      /*
              инициализируем отправку формы
      */      return this._form.ajaxForm({
        url: this._getUrlPrefix() + this._getFormUrl(),
        dataType: "json",
        beforeSubmit: this._beforeSubmit,
        success: this._onSuccess,
        error: this._onError
      });
    };

    Panel.prototype._showSuccessMessage = function(message) {
      /*
              показывает сообщение если все получилось
      */
      var _ref, _ref2;
      if ((_ref = this._successMsg) != null) _ref.text(message);
      return (_ref2 = this._successMsg) != null ? _ref2.removeClass('hidden') : void 0;
    };

    Panel.prototype._hideSuccessMessage = function() {
      var _ref;
      return (_ref = this._successMsg) != null ? _ref.addClass('hidden') : void 0;
    };

    Panel.prototype._showError = function(message, field, showBefore) {
      if (field == null) field = null;
      if (showBefore == null) showBefore = false;
      /*
              показывает сообщение об ошибке
      */
      return this._errors.showError(message, field, showBefore);
    };

    Panel.prototype._hideError = function() {
      return this._errors.hideError();
    };

    Panel.prototype._getUrlPrefix = function() {
      /*
              https и имя хоста, если скрипт запущен на Риззоме,
              Пустая строка, если запущено на dev-сервере.
      */
      var hostname;
      hostname = document.location.hostname;
      if (/rizzoma\.com$/.test(hostname)) return "https://" + hostname;
      return "";
    };

    Panel.prototype._getFormUrl = function() {
      /*
              url на который постится форма
              должен переопределяться в потомках
      */      throw new Error("Not implemented");
    };

    Panel.prototype._beforeSubmit = function(formData, form, options) {
      /*
              Валидирует форму перед отправкой
              должно переропределеяться в потомках
              @return: bool - если вернуть false то форма не отправится
      */      this._hideError();
      this._submitBtn.addClass('active');
      return true;
    };

    Panel.prototype._onError = function(err) {
      /*
              Чего делать когда пришла внутренняя ошибка сервера или таймаут
      */      this._submitBtn.removeClass('active');
      return this._showError("Internal Server Error");
    };

    Panel.prototype._onSuccess = function(data, statusText, xhr, form) {
      /*
              Чего делать когда все хорошо
      */      return this._submitBtn.removeClass('active');
    };

    Panel.prototype._validateUsernameField = function(usernameField, showBefore) {
      var username;
      if (showBefore == null) showBefore = false;
      username = this._usernameField.val().trim();
      if (!username) {
        this._showError("Empty email", usernameField, showBefore);
        return false;
      }
      if (!isEmail(username)) {
        this._showError("" + username + " is not a valid email", usernameField, showBefore);
        return false;
      }
      return true;
    };

    Panel.prototype._validatePasswordField = function(passwordField) {
      var password;
      password = this._passwordField.val().trim();
      if (!password) {
        this._showError("Empty password", passwordField);
        return false;
      }
      return true;
    };

    Panel.prototype._removeSubmitBtnActiveState = function() {
      var _this = this;
      return setTimeout(function() {
        return _this._submitBtn.removeClass('active');
      }, 0);
    };

    Panel.prototype._showFormFields = function() {};

    return Panel;

  })();

  SignInPanel = (function(_super) {

    __extends(SignInPanel, _super);

    /*
        панель входа в систему
    */

    function SignInPanel(errors, url) {
      this._onSuccess = __bind(this._onSuccess, this);
      this._beforeSubmit = __bind(this._beforeSubmit, this);
      this._getFormUrl = __bind(this._getFormUrl, this);      SignInPanel.__super__.constructor.call(this, errors, url);
      this._showSignUpFormLink = this._form.find(".js-show-sign-up-form-link");
      this._usernameField = this._form.find("[name=username]");
      this._passwordField = this._form.find("[name=password]");
      this._showForgotPasswordFormLink = $(".js-show-forgot-password-form-link");
      this._submitBtn = this._form.find("[type=submit]");
      this._submitBtn.on('click', function() {
        return _gaq.push(['_trackEvent', 'Authorization', 'Sign in with password', window.location.pathname]);
      });
      this._form.find(".js-google-login-link").on('click', function() {
        return _gaq.push(['_trackEvent', 'Authorization', 'Authorize with Google click', window.location.pathname]);
      });
      this._form.find(".js-facebook-login-link").on('click', function() {
        return _gaq.push(['_trackEvent', 'Authorization', 'Authorize with Facebook click', window.location.pathname]);
      });
    }

    SignInPanel.prototype.getShowSignUpFormLink = function() {
      return this._showSignUpFormLink;
    };

    SignInPanel.prototype.getShowForgotPasswordFormLink = function() {
      return this._showForgotPasswordFormLink;
    };

    SignInPanel.prototype._getForm = function() {
      return $("#sign-in-form");
    };

    SignInPanel.prototype._getFormUrl = function() {
      return "/auth/password/json/";
    };

    SignInPanel.prototype._beforeSubmit = function(formData, form, options) {
      SignInPanel.__super__._beforeSubmit.call(this, formData, form, options);
      if (!this._validateUsernameField(this._usernameField)) {
        this._removeSubmitBtnActiveState();
        return false;
      }
      if (!this._validatePasswordField(this._passwordField)) {
        this._removeSubmitBtnActiveState();
        return false;
      }
      return true;
    };

    SignInPanel.prototype._getURLParameter = function(name, url) {
      if (url == null) url = location.search;
      return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(url) || [null, null])[1]);
    };

    SignInPanel.prototype._onSuccess = function(data, statusText, xhr, form) {
      var field;
      SignInPanel.__super__._onSuccess.call(this, data, statusText, xhr, form);
      field = null;
      if (data.error) {
        switch (data.error.code) {
          case "empty_email":
            field = this._usernameField;
            break;
          case "invalid_email":
            field = this._usernameField;
            break;
          case "user_not_found":
            field = this._usernameField;
            break;
          case "user_not_confirmed":
            field = this._usernameField;
            break;
          case "empty_pasword":
            field = this._usernameField;
            break;
          case "wrong_password":
            field = this._passwordField;
        }
        return this._showError(data.error.message, field);
      } else {
        return document.location.href = this._next;
      }
    };

    SignInPanel.prototype._showFormFields = function() {};

    return SignInPanel;

  })(Panel);

  SignUpPanel = (function(_super) {

    __extends(SignUpPanel, _super);

    /*
        панель регистрации
    */

    function SignUpPanel(errors, url) {
      this._onSuccess = __bind(this._onSuccess, this);
      this._beforeSubmit = __bind(this._beforeSubmit, this);
      this._getFormUrl = __bind(this._getFormUrl, this);      SignUpPanel.__super__.constructor.call(this, errors, url);
      this._showSignInFormLink = this._form.find(".js-show-sign-in-form-link");
      this._usernameField = this._form.find("[name=username]");
      this._nameField = this._form.find("[name=name]");
      this._passwordField = this._form.find("[name=password]");
      this._submitBtn = this._form.find("[type=submit]");
      this._submitBtn.on('click', function() {
        return _gaq.push(['_trackEvent', 'Authorization', 'Sign up with password', window.location.pathname]);
      });
      this._form.find(".js-google-login-link").on('click', function() {
        return _gaq.push(['_trackEvent', 'Authorization', 'Authorize with Google click', window.location.pathname]);
      });
      this._form.find(".js-facebook-login-link").on('click', function() {
        return _gaq.push(['_trackEvent', 'Authorization', 'Authorize with Facebook click', window.location.pathname]);
      });
    }

    SignUpPanel.prototype.getShowSignInFormLink = function() {
      return this._showSignInFormLink;
    };

    SignUpPanel.prototype._getForm = function() {
      return $("#sign-up-form");
    };

    SignUpPanel.prototype._getFormUrl = function() {
      return "/auth/register/json/";
    };

    SignUpPanel.prototype._beforeSubmit = function(formData, form, options) {
      SignUpPanel.__super__._beforeSubmit.call(this, formData, form, options);
      if (!this._nameField.val().trim()) {
        this._showError("Empty name", this._nameField);
        this._removeSubmitBtnActiveState();
        return false;
      }
      if (!this._validateUsernameField(this._usernameField)) {
        this._removeSubmitBtnActiveState();
        return false;
      }
      if (!this._validatePasswordField(this._passwordField)) {
        this._removeSubmitBtnActiveState();
        return false;
      }
      return true;
    };

    SignUpPanel.prototype._onSuccess = function(data, statusText, xhr, form) {
      var field;
      SignUpPanel.__super__._onSuccess.call(this, data, statusText, xhr, form);
      field = null;
      if (data.error) {
        switch (data.error.code) {
          case "empty_name":
            field = this._nameField;
            break;
          case "empty_email":
            field = this._usernameField;
            break;
          case "invalid_email":
            field = this._usernameField;
            break;
          case "already_registered":
            field = this._usernameField;
            break;
          case "user_not_found":
            field = this._usernameField;
            break;
          case "user_not_confirmed":
            field = this._usernameField;
            break;
          case "empty_pasword":
            field = this._usernameField;
            break;
          case "short_password":
            field = this._usernameField;
            break;
          case "wrong_password":
            field = this._passwordField;
        }
        return this._showError(data.error.message, field);
      } else {
        this._hideFormFields();
        return this._showSuccessMessage("We have sent you an email with instructions for completing your registration");
      }
    };

    SignUpPanel.prototype._hideFormFields = function() {
      this._usernameField.addClass("hidden");
      this._nameField.addClass("hidden");
      this._passwordField.addClass("hidden");
      return this._submitBtn.addClass("hidden");
    };

    SignUpPanel.prototype._showFormFields = function() {
      this._usernameField.removeClass("hidden");
      this._nameField.removeClass("hidden");
      this._passwordField.removeClass("hidden");
      return this._submitBtn.removeClass("hidden");
    };

    return SignUpPanel;

  })(Panel);

  ForgotPasswordPanel = (function(_super) {

    __extends(ForgotPasswordPanel, _super);

    /*
        панель для напоминания пароля
    */

    function ForgotPasswordPanel(errors) {
      this._onSuccess = __bind(this._onSuccess, this);
      this._beforeSubmit = __bind(this._beforeSubmit, this);
      this._getFormUrl = __bind(this._getFormUrl, this);      ForgotPasswordPanel.__super__.constructor.call(this, errors);
      this._showSignInFormLink = this._form.find(".js-show-sign-in-form-link");
      this._usernameField = this._form.find("[name=username]");
      this._submitBtn = this._form.find("[type=submit]");
      this._submitBtn.on('click', function() {
        return _gaq.push(['_trackEvent', 'Authorization', 'Reset password', window.location.pathname]);
      });
    }

    ForgotPasswordPanel.prototype.getShowSignInFormLink = function() {
      return this._showSignInFormLink;
    };

    ForgotPasswordPanel.prototype._getForm = function() {
      return $("#forgot-password-form");
    };

    ForgotPasswordPanel.prototype._getFormUrl = function() {
      return "/auth/forgot_password/json/";
    };

    ForgotPasswordPanel.prototype._beforeSubmit = function(formData, form, options) {
      ForgotPasswordPanel.__super__._beforeSubmit.call(this, formData, form, options);
      if (!this._validateUsernameField(this._usernameField, true)) {
        this._removeSubmitBtnActiveState();
        return false;
      }
    };

    ForgotPasswordPanel.prototype._onSuccess = function(data, statusText, xhr, form) {
      var field;
      ForgotPasswordPanel.__super__._onSuccess.call(this, data, statusText, xhr, form);
      field = null;
      if (data.error) {
        switch (data.error.code) {
          case "empty_email":
            field = this._usernameField;
            break;
          case "invalid_email":
            field = this._usernameField;
            break;
          case "user_not_found":
            field = this._usernameField;
            break;
          case "user_not_confirmed":
            field = this._usernameField;
        }
        return this._showError(data.error.message, field, true);
      } else {
        this._hideFormFields();
        return this._showSuccessMessage("Reset link has been sent successfully. Check your email");
      }
    };

    ForgotPasswordPanel.prototype._hideFormFields = function() {
      this._usernameField.addClass("hidden");
      return this._submitBtn.addClass("hidden");
    };

    ForgotPasswordPanel.prototype._showFormFields = function() {
      this._usernameField.removeClass("hidden");
      return this._submitBtn.removeClass("hidden");
    };

    return ForgotPasswordPanel;

  })(Panel);

  ErrorContainer = (function() {
    /*
        Контейнер для ошибок
    */
    function ErrorContainer() {
      var _this = this;
      this._errors = $('.js-errors');
      this._erroredField = null;
      this._errors.find(':first-child').click(function(e) {
        return _this.hideError();
      });
    }

    ErrorContainer.prototype.showError = function(message, field, hideBefore) {
      var _ref;
      if (field == null) field = null;
      if (hideBefore == null) hideBefore = false;
      /*
              показывает сообщение об ошибке
      */
      this._errors.removeClass("hide-before");
      if ((_ref = this._erroredField) != null) _ref.removeClass("error-border");
      this._errors.removeClass("hidden");
      this._errors.find(".js-msg").text(message);
      if (field) {
        field.addClass("error-border");
        field.focus();
        this._erroredField = field;
      }
      if (hideBefore) return this._errors.addClass("hide-before");
    };

    ErrorContainer.prototype.hideError = function() {
      var _ref;
      this._errors.addClass("hidden");
      this._errors.removeClass("hide-before");
      return (_ref = this._erroredField) != null ? _ref.removeClass("error-border") : void 0;
    };

    return ErrorContainer;

  })();

  AuthDialog = (function() {
    /*
        Диалог логина в риззому
        если closable навешивает показ формы на элементы с классом .js-enter-rizzoma-btn
    */
    function AuthDialog() {
      this._onShowBtn = __bind(this._onShowBtn, this);
      this._onClose = __bind(this._onClose, this);      this._authDialog = null;
      this._closeAuthDialogBtn = null;
      this._panels = {};
      this._inited = false;
      this._errors = null;
    }

    AuthDialog.prototype.initAndShow = function(closable, url, callback) {
      var _this = this;
      if (closable == null) closable = true;
      if (url == null) url = null;
      /*
              @param closable: bool - навешивать или нет события закрывания диалога
              @param url: string - куда редиректить после авторизации
      */
      if (window.androidJSInterface) return window.androidJSInterface.onLogout();
      if (this._inited) return this._showAsync(callback);
      return this.init(closable, url, function() {
        return _this._showAsync(callback);
      });
    };

    AuthDialog.prototype.init = function(closable, url, callback) {
      var _this = this;
      if (closable == null) closable = true;
      if (url == null) url = null;
      /*
              @param closable: bool - навешивать или нет события закрывания диалога
              @param url: string - куда редиректить после авторизации
      */
      if (this._inited) {
        return typeof callback === "function" ? callback(null) : void 0;
      }
      return $(document).ready(function() {
        _this._authDialog = $(".js-auth-dialog");
        if (closable) {
          _this._initCloseAuthDialog();
          _this._initShowAuthDialog();
        }
        _this._initErrors();
        _this._initPanels(url);
        _this._inited = true;
        return typeof callback === "function" ? callback(null) : void 0;
      });
    };

    AuthDialog.prototype._onClose = function(e) {
      if (e.target !== e.delegateTarget) return;
      this._authDialog.addClass('hidden');
      e.preventDefault();
      return e.stopPropagation();
    };

    AuthDialog.prototype.show = function() {
      this._showPanel(this._panels.signInPanel);
      return this._authDialog.removeClass('hidden');
    };

    AuthDialog.prototype.visible = function() {
      return !!this._authDialog && !this._authDialog.hasClass('hidden');
    };

    AuthDialog.prototype.setNext = function(url) {
      /*
              Устанавливает редирект после логина
              @param url относительный url, должен начинаться со слеша
      */
      var name, panel, _ref, _results;
      _ref = this._panels;
      _results = [];
      for (name in _ref) {
        panel = _ref[name];
        _results.push(panel.setNext(url));
      }
      return _results;
    };

    AuthDialog.prototype._onShowBtn = function(e) {
      /*
              по нажатию на кнопку показа
      */
      var next;
      next = $(e.target).attr("data-redirect-url");
      if (next) this.setNext(next);
      this.show();
      e.preventDefault();
      return e.stopPropagation();
    };

    AuthDialog.prototype._showAsync = function(callback) {
      this.show();
      return typeof callback === "function" ? callback(null) : void 0;
    };

    AuthDialog.prototype._initErrors = function() {
      return this._errors = new ErrorContainer();
    };

    AuthDialog.prototype._initPanels = function(url) {
      /*
              @param url: string - куда редиректить после авторизации
      */      this._panels.signInPanel = new SignInPanel(this._errors, url);
      this._panels.signUpPanel = new SignUpPanel(this._errors, url);
      this._panels.forgotPasswordPanel = new ForgotPasswordPanel(this._errors);
      return this._initTogglePanels();
    };

    AuthDialog.prototype._showPanel = function(showedPanel) {
      var name, panel, _ref, _results;
      _ref = this._panels;
      _results = [];
      for (name in _ref) {
        panel = _ref[name];
        if (panel === showedPanel) {
          _results.push(panel.show());
        } else {
          _results.push(panel.hide());
        }
      }
      return _results;
    };

    AuthDialog.prototype._getOnShowPanel = function(panel) {
      var _this = this;
      return function(e) {
        _this._showPanel(panel);
        e.preventDefault();
        return e.stopPropagation();
      };
    };

    AuthDialog.prototype._initTogglePanels = function() {
      this._panels.signInPanel.getShowSignUpFormLink().click(this._getOnShowPanel(this._panels.signUpPanel));
      this._panels.signInPanel.getShowForgotPasswordFormLink().click(this._getOnShowPanel(this._panels.forgotPasswordPanel));
      this._panels.signUpPanel.getShowSignInFormLink().click(this._getOnShowPanel(this._panels.signInPanel));
      return this._panels.forgotPasswordPanel.getShowSignInFormLink().click(this._getOnShowPanel(this._panels.signInPanel));
    };

    AuthDialog.prototype._initCloseAuthDialog = function() {
      this._closeAuthDialogBtn = $(".js-close-auth-dialog-btn");
      this._closeAuthDialogBtn.removeClass('hidden');
      this._closeAuthDialogBtn.click(this._onClose);
      return this._authDialog.click(this._onClose);
    };

    AuthDialog.prototype._initShowAuthDialog = function() {
      /*
              навешивает показ формы на элементы с классом .js-enter-rizzoma-btn
      */
      var showBtn;
      showBtn = $(".js-enter-rizzoma-btn");
      return showBtn.click(this._onShowBtn);
    };

    return AuthDialog;

  })();

  window.AuthDialog = new AuthDialog();

}).call(this);
