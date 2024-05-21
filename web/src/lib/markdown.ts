import { marked } from 'marked';
import markedAlert from 'marked-alert';
import markedLinkifyIt from 'marked-linkify-it';

const renderer = {
  image(href: string, title: string|null, text: string) {
    return `
      <div class="md-img">
        <img src="${href}" alt="${text}" />
        <p><u>Image:</u> ${text}</p>
      </div>
    `;
  },
};

marked.use(
  markedLinkifyIt({}, {}), 
  markedAlert({
    className: 'md-alert',
    variants: [
      {
        type: 'note',
        icon: '<i class="fas fa-info-circle"></i>',
        title: 'Note',
      },
      {
        type: 'warning',
        icon: '<i class="fas fa-exclamation-triangle"></i>',
        title: 'Warning',
      },
      {
        type: 'tip',
        icon: '<i class="fas fa-lightbulb"></i>',
        title: 'Tip',
      },
      {
        type: 'important',
        icon: '<i class="fas fa-bullseye"></i>',
        title: 'Important',
      },
      {
        type: 'caution',
        icon: '<i class="fas fa-exclamation-circle"></i>',
        title: 'Caution',
      }
    ],
  }), 
  { renderer }
);

export { marked };