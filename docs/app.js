document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  document.getElementById('yearSpan').textContent = new Date().getFullYear();

  // --- Theme Toggle Logic ---
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  let currentTheme = localStorage.getItem('murasil_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    try {
      localStorage.setItem('murasil_theme', currentTheme);
    } catch (e) {
      console.warn('LocalStorage not accessible', e);
    }
  });

  // --- FAQ Accordion Logic ---
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');
      
      // Close all other FAQs
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // --- Interactive Live Demo Chat State & Logic ---
  const initialContacts = [
    {
      id: 'sara',
      name: 'سارة المصممة 🎨',
      avatar: 'س',
      status: 'متصل الآن - ترد فوراً',
      lastMsg: 'أهلاً! جرب إرسال أي رسالة...',
      autoReplies: [
        'أهلاً بك! يسرني تواصلك في التجربة المباشرة 🌟',
        'تطبيق مراسَل يمتاز بالسرعة والسلاسة التامة.',
        'يمكنك تجربة طباعة أي سؤال وستصلك استجابة فورية!'
      ]
    },
    {
      id: 'ahmed',
      name: 'أحمد مطور النظم 💻',
      avatar: 'أ',
      status: 'مشغول بالعمل ⚡',
      lastMsg: 'الأكواد تعمل بدون أي إنترنت خارجي!',
      autoReplies: [
        'مرحباً! التطبيق مبني بأدوات خفيفة ونظيفة بدون مكتبات خارجية.',
        'سرعة الأداء أولوية كبرى في هذا المشروع 👍',
        'كل الرسائل تحفظ محلياً على جهازك لخصوصية كاملة.'
      ]
    },
    {
      id: 'group',
      name: 'مجموعة عمل مراسَل 🚀',
      avatar: 'م',
      status: '3 أعضاء متصلون',
      lastMsg: 'فريق العمل يرحب بك',
      autoReplies: [
        'مرحباً بك في المجموعة التجريبية 🎉',
        'فريق العمل يعمل بجد لتقديم أفضل تجربة مراسلة مستقرة.',
        'تواصل معنا دائماً لأي استفسار!'
      ]
    }
  ];

  let activeContactId = 'sara';

  // Load chat messages from localStorage if available
  let chatsData = {};
  try {
    const saved = localStorage.getItem('murasil_demo_chats');
    if (saved) {
      chatsData = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('LocalStorage access blocked', e);
  }

  // Populate default messages if empty
  if (!chatsData.sara || chatsData.sara.length === 0) {
    chatsData = {
      sara: [
        { sender: 'received', text: 'مرحباً بك في التطبيق التجريبي لمراسَل! 👋', time: getFormattedTime() },
        { sender: 'received', text: 'كيف يمكنني مساعدتك اليوم؟', time: getFormattedTime() }
      ],
      ahmed: [
        { sender: 'received', text: 'أهلاً بك! تم ضبط الأداء ليعمل بسرعة فائقة ⚡', time: getFormattedTime() }
      ],
      group: [
        { sender: 'received', text: 'أهلاً بك في مجموعة التجربة الحية 🚀', time: getFormattedTime() }
      ]
    };
  }

  // Element Refs
  const contactsListEl = document.getElementById('contactsList');
  const messagesContainer = document.getElementById('messagesContainer');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const sendVoiceBtn = document.getElementById('sendVoiceBtn');
  const typingIndicator = document.getElementById('typingIndicator');
  const activeAvatar = document.getElementById('activeAvatar');
  const activeName = document.getElementById('activeName');
  const activeStatus = document.getElementById('activeStatus');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const emojiToggleBtn = document.getElementById('emojiToggleBtn');
  const emojiPopover = document.getElementById('emojiPopover');

  function saveChats() {
    try {
      localStorage.setItem('murasil_demo_chats', JSON.stringify(chatsData));
    } catch (e) {}
  }

  function getFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  function renderContacts() {
    contactsListEl.innerHTML = '';
    initialContacts.forEach(contact => {
      const item = document.createElement('div');
      item.className = `contact-item ${contact.id === activeContactId ? 'active' : ''}`;
      
      const lastMsgList = chatsData[contact.id] || [];
      const lastText = lastMsgList.length > 0 ? lastMsgList[lastMsgList.length - 1].text : contact.lastMsg;

      item.innerHTML = `
        <div class="avatar-wrapper">
          <div class="avatar">${contact.avatar}</div>
          <span class="status-indicator online"></span>
        </div>
        <div class="contact-details">
          <div class="contact-name">${contact.name}</div>
          <div class="contact-lastmsg">${lastText}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        activeContactId = contact.id;
        renderContacts();
        updateActiveHeader();
        renderMessages();
      });

      contactsListEl.appendChild(item);
    });
  }

  function updateActiveHeader() {
    const contact = initialContacts.find(c => c.id === activeContactId);
    if (contact) {
      activeAvatar.textContent = contact.avatar;
      activeName.textContent = contact.name;
      activeStatus.textContent = contact.status;
    }
  }

  function renderMessages() {
    messagesContainer.innerHTML = '';
    const msgs = chatsData[activeContactId] || [];

    msgs.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${msg.sender}`;

      if (msg.sender === 'sent') {
        bubble.innerHTML = `
          <span>${escapeHtml(msg.text)}</span>
          <span class="msg-status">
            <span class="msg-time">${msg.time}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
        `;
      } else {
        bubble.innerHTML = `
          <span>${escapeHtml(msg.text)}</span>
          <span class="msg-time">${msg.time}</span>
        `;
      }

      messagesContainer.appendChild(bubble);
    });

    scrollToBottom();
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function sendMessage(text) {
    if (!text.trim()) return;

    const time = getFormattedTime();
    if (!chatsData[activeContactId]) {
      chatsData[activeContactId] = [];
    }

    // Add user message
    chatsData[activeContactId].push({
      sender: 'sent',
      text: text,
      time: time
    });

    saveChats();
    renderMessages();
    renderContacts();
    chatInput.value = '';

    // Simulate Automated Smart Reply
    simulateBotReply();
  }

  function simulateBotReply() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();

    setTimeout(() => {
      typingIndicator.style.display = 'none';
      const contact = initialContacts.find(c => c.id === activeContactId);
      const replies = contact ? contact.autoReplies : ['تم استلام رسالتك بنجاح! 🎉'];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      chatsData[activeContactId].push({
        sender: 'received',
        text: randomReply,
        time: getFormattedTime()
      });

      saveChats();
      renderMessages();
      renderContacts();
    }, 1200);
  }

  // Event Listeners for Input
  sendBtn.addEventListener('click', () => {
    sendMessage(chatInput.value);
  });

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage(chatInput.value);
    }
  });

  sendVoiceBtn.addEventListener('click', () => {
    sendMessage('🎤 [ملاحظة صوتية تجريبية - 0:05]');
  });

  // Preset button global helper
  window.sendPresetMessage = function(presetText) {
    sendMessage(presetText);
  };

  // Clear Chat History
  clearChatBtn.addEventListener('click', () => {
    if (confirm('هل أنت تأكد من مسح محادثات هذا التطبيق التجريبي؟')) {
      chatsData = {
        sara: [{ sender: 'received', text: 'تمت اعادة ضبط المحادثة بنجاح! ✨', time: getFormattedTime() }],
        ahmed: [],
        group: []
      };
      saveChats();
      renderMessages();
      renderContacts();
    }
  });

  // Emoji Popover Toggle
  emojiToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = emojiPopover.style.display === 'grid';
    emojiPopover.style.display = isVisible ? 'none' : 'grid';
  });

  document.addEventListener('click', () => {
    emojiPopover.style.display = 'none';
  });

  emojiPopover.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target.tagName === 'SPAN') {
      chatInput.value += e.target.textContent;
      emojiPopover.style.display = 'none';
      chatInput.focus();
    }
  });

  // Initial load calls
  renderContacts();
  updateActiveHeader();
  renderMessages();
});
