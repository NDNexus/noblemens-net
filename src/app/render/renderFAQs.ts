type FAQ = {
    question: string;
    answer: string;
};

export function renderFAQs(faqs: FAQ[], containerId = "faq-list") {
    const container = document.getElementById(containerId);
    if (!container || !faqs?.length) return;

    const template = document.getElementById("faq-item-template");

    if (!template) {
        console.error("FAQ template not found");
        return;
    }

    let html = "";

    faqs.forEach((faq, index) => {
        let item = template.innerHTML;

        item = item.replace(/{{question}}/g, faq.question);
        item = item.replace(/{{answer}}/g, faq.answer);

        // 👇 First item open
        if (index === 0) {
            item = item.replace('aria-expanded="false"', 'aria-expanded="true"');
            item = item.replace('faq-item', 'faq-item active');
        }

        html += item;
    });

    container.innerHTML = html;

    initFAQInteractions();
}

export function initFAQInteractions() {
    document.querySelectorAll(".faq-trigger").forEach(trigger => {

        trigger.addEventListener("click", () => {
            const item = trigger.closest(".faq-item");
            if (!item) return;

            const isOpen = item.classList.contains("active");

            // Close all
            document.querySelectorAll(".faq-item").forEach(i => {
                i.classList.remove("active");

                const btn = i.querySelector(".faq-trigger");
                if (btn) btn.setAttribute("aria-expanded", "false");
            });

            // Open clicked
            if (!isOpen) {
                item.classList.add("active");
                trigger.setAttribute("aria-expanded", "true");
            }
        });

    });
}