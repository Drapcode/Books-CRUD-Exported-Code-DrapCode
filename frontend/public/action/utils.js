const htmlRegex =
  /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i;
const getFormDataOfElement = (formElement) => {
  let formData = {};
  Object.values(formElement.elements).map((el) => {
    if (el.name) {
      if (el.type === 'hidden') {
        formData[el.name] = el.value;
      } else {
        if (el.tagName === 'SELECT') {
          const selected = [...el.selectedOptions].map((option) => option.value);
          formData[el.name] = selected.length === 1 ? selected.join('') : selected;
        } else {
          formData[el.name] = el.value;
        }
      }
    }
  });
  return formData;
};

const serializeFormData = (elements = []) => {
  let data = {};
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    let val;
    if (el.type === 'file') {
    } else if (el.type === 'checkbox') {
      val = el.checked;
    } else if (el.tagName === 'SELECT') {
      const selected = [...el.selectedOptions].map((option) => option.value);
      val = selected.length === 1 ? selected.join('') : selected.filter((val) => val !== '');
    } else if ($(el).attr('type') === 'tel') {
      val = $(el).intlTelInput('getNumber');
    } else if (el.type === 'number') {
      val = el.value === '' ? '' : Number(el.value);
    } else if ($(el).attr('flat-picker-date-type') === 'datetime-local') {
      val = el.value ? flatpickr.parseDate(el.value, 'Z') : '';
    } else {
      val = trim(el.value);
    }
    let fullName = el.getAttribute('name');
    if (!fullName) continue;
    let fullNameParts = fullName.split('.');
    let prefix = '';
    let stack = data;
    for (let k = 0; k < fullNameParts.length - 1; k++) {
      prefix = fullNameParts[k];
      //Used to remove [] from multiselect
      if (prefix.includes('[')) {
        prefix = prefix.replace('[]', '');
      }
      if (!stack[prefix]) {
        stack[prefix] = {};
      }
      stack = stack[prefix];
    }
    prefix = fullNameParts[fullNameParts.length - 1];
    //Used to remove [] from multiselect
    if (prefix.includes('[')) {
      prefix = prefix.replace('[]', '');
    }
    if (stack[prefix]) {
      const newVal = stack[prefix] + ',' + val;
      stack[prefix] += newVal;
    } else {
      stack[prefix] = val;
    }
  }
  return data;
};

const findFieldValueFromFormData = (formElement, fieldName) => {
  let formData = {};
  Object.values(formElement.elements).map((el) => {
    if (el.name) {
      if (el.type === 'hidden') {
        formData[el.name] = el.value;
      } else {
        if (el.tagName === 'SELECT') {
          const selected = [...el.selectedOptions].map((option) => option.value);
          formData[el.name] = selected.length === 1 ? selected.join('') : selected;
        } else {
          formData[el.name] = el.value;
        }
      }
    }
  });
  return formData;
};

(async () => {
  let textarea = $('textarea');
  let isTextareaFieldExist = textarea.length;
  if (isTextareaFieldExist) {
    textarea.each(function () {
      let input = $(this);
      //let width = input.width();
      //Checking to show/hide WYSIWYG Editor
      let showTextEditor = input[0].hasAttribute('data-show-editor');
      if (showTextEditor) {
        input.summernote({
          //width,
          tabsize: 2,
          focus: true,
          callbacks: {
            onImageUpload: async function (files, editor, welEditable) {
              const formData = new FormData();
              let endpoint = 'file/editor';
              formData.append('file', files[0]);
              const { data } = await multipartFormDataSecuredCall(formData, endpoint);
              const img = $('<img>').attr({
                src: `${s3BucketURL}/${data.key}`,
              });
              input.summernote('insertNode', img[0]);
            },
          },
        });
      }
    });
  }
})();

(async () => {
  let dateField = $('input[type=datetime-local], input[type=date]');
  let isDateFieldExist = dateField.length;
  if (isDateFieldExist) {
    dateField.each(function () {
      let input = $(this);
      let showTime = $(input[0]).attr('type') === 'datetime-local';
      input.attr('autocomplete', 'off');
      input.attr('placeholder', showTime ? 'YYYY-MM-DD HH:MM AM' : 'YYYY-MM-DD');
      input.attr('flat-picker-date-type', showTime ? 'datetime-local' : 'date');
      input?.flatpickr({
        enableTime: showTime,
        dateFormat: showTime ? 'Y-m-d h:i K' : 'Y-m-d',
        //time_24hr: true,
        minuteIncrement: 1,
        allowInput: true,
        onOpen: function (selectedDates, dateStr, instance) {
          $(instance.altInput).prop('readonly', true);
        },
        onClose: function (selectedDates, dateStr, instance) {
          $(instance.altInput).prop('readonly', false);
          $(instance.altInput).blur();
        },
      });
    });
  }
})();

(async () => {
  let phoneNumberField = $('input[type=tel]');
  let isPhoneNumberFieldExist = phoneNumberField.length;
  if (isPhoneNumberFieldExist) {
    phoneNumberField.intlTelInput({
      utilsScript: '/resources/lib/intl-tel-input/utils.js',
    });
  }
})();

/***
 * To create custom validation for phone number
 */
$(document).ready(function () {
  $.validator.addMethod('validPhoneNumber', function (value, element) {
    return this.optional(element) || $(element).intlTelInput('isValidNumber');
  });
});

(async () => {
  $('.select').on('change', function () {
    const values = $(this).val();
    if (Array.isArray(values) && values.length > 1) {
      const index = values.indexOf('');
      if (index > -1) {
        values.splice(index, 1);
        $(this).val(values);
      }
    } else if (Array.isArray(values) && values.length === 0) {
      $(this).val('');
    }
    $(this).trigger('change.select2'); // Notify only Select2 of changes;
  });
})();
