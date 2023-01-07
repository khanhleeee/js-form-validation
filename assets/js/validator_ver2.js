// Variables
var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);
function Validator(formSelector) {
   const _this = this;
   var formRules = {};


   function getParent(element, selector) {
      if(element.closest(selector)) {
         return element.closest(selector);
      }
   }
   /**
    * Create rule:
    * - If have error => return `error message`
    * - If not return undefined
    */
   var validateRules = {
      required: (value, message) => {
         return value ? undefined : message || 'Please fill the blank'
      },
      email: (value, message) => {
         var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
         return regex.test(value) ? undefined : message ||'Invalid email address. Valid e-mail can contain only latin letters, numbers, \'@ \' and .'
      },
      min: (min, message) => {
         return (value) => {
            return value.length >= min ? undefined : message || `Password need at least ${min} characters`
         }
      }
   }
   // Get DOM element by formSelector 
   const formElement = $(formSelector);
   
   // Operate when formElement exist
   if(formElement) {
      const inputElements = formElement.querySelectorAll('[name][rules]');

      for(var input of inputElements) {
         let rules = input.getAttribute('rules').split('|');

         for(var rule of rules) {
            // Check rule has value with ':'
            let isRuleHasValue = rule.includes(':');
            let ruleFunc = validateRules[rule];
            if(isRuleHasValue) {
               let ruleCondition = rule.split(':');
               rule = ruleCondition[0];
               ruleFunc = validateRules[rule](ruleCondition[1])
            }

            if(Array.isArray(formRules[input.name])) {
               formRules[input.name].push(ruleFunc);
            } else {
               formRules[input.name] = [ruleFunc];
            }
         }
         // Add event listener (blur, change, ...) 
         input.onblur = hadnleValidate;
         input.oninput = hadnleClearError;
      }
      function hadnleValidate(e) {
         var rules = formRules[e.target.name];
         var errorMessage;

         for(var rule of rules) {
            errorMessage = rule(e.target.value);
            if(errorMessage) break;
         }

         if(errorMessage) {
            const inputParent = getParent(e.target, '.form__group');
            if(inputParent) {
               var formMessage = inputParent.querySelector('.form__message');
               formMessage.innerText = errorMessage;
               inputParent.classList.add('invalid');
            }
         }
         // If no errormessage => return true
         return !errorMessage; 
      }
      function hadnleClearError(e) {
         var inputParent = getParent(e.target, '.form__group');
         if(inputParent.classList.contains('invalid')) {
            inputParent.classList.remove('invalid');
            var formMessage = inputParent.querySelector('.form__message');
            if(formMessage) {
               formMessage.innerText = '';
            }
         }
      }
   }
   
   // Handle submit form
   formElement.onsubmit = (e) => {
      e.preventDefault();

      const inputElements = formElement.querySelectorAll('[name][rules]');
      var isFormValid = true;

      for(var input of inputElements) {
         if(!hadnleValidate({target: input})) {
            isFormValid = false;
         }
      }
      if(isFormValid) {
         if(typeof _this.onSubmit === 'function') {
            var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
            var formValues = Array.from(enableInputs).reduce((values, currentInput) => {
               switch (currentInput.type) {
                  case 'radio':
                     if(currentInput.matches(':checked')) {
                        values[currentInput.name] = currentInput.value
                     }
                     break;
                  case 'checkbox':
                     if(!currentInput.matches(':checked')) {
                        values[currentInput.name] = '';
                        return values;
                     }
                     if(!Array.isArray(values[currentInput.name])) {
                        values[currentInput.name] = [];
                     }
                     values[currentInput.name].push(currentInput.value);
                     break;
                  case 'file':
                     values[currentInput.name] = currentInput.files;
                     break;
                     default:
                     values[currentInput.name] = currentInput.value;
               }
               return values;
            }, {})
            _this.onSubmit(formValues);
         } else {
            formElement.submit();
         }
      }
   }
}