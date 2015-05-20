;; .emacs

;;; uncomment this line to disable loading of "default.el" at startup
;; (setq inhibit-default-init t)

;; adding ~/emacs to load-path
(add-to-list 'load-path "~/emacs/")

;;(add-to-list 'load-path "~/emacs/cc-mode-5.31.3/")

;; turn on font-lock mode
(when (fboundp 'global-font-lock-mode)
  (global-font-lock-mode t))

;; enable visual feedback on selections
;(setq transient-mark-mode t)

;; default to better frame titles
(setq frame-title-format
      (concat  "%b - emacs@" (system-name)))

;; default to unified diffs
(setq diff-switches "-u")

;; always end a file with a newline
;(setq require-final-newline 'query)

;; set programmer dvorak by default
(load-library "programmer-dvorak")
(defadvice switch-to-buffer (after activate-input-method activate)
    (activate-input-method "programmer-dvorak"))
(setq default-input-method "russian-computer")





;; track recent opened files history
(require 'recentf)
(recentf-mode 1)
(setq recentf-max-menu-items 25)
(global-set-key "\C-x\ \C-r" 'recentf-open-files)

;; indent for c (and php) mode equals 4 columns
(setq c-basic-offset 4)

;; use space for indentation instead of tabs
(setq-default indent-tabs-mode nil)

;; Dont show startup screen
(setq inhibit-startup-message t)

;; Use selection mark
(setq transient-mark-mode t)

;; Show column number
(setq column-number-mode t)


;; Display the time
(setq display-time-day-and-date t
            display-time-24hr-format t)
(display-time)


(set-frame-font "DejaVu Sans Mono-7")
;;(set-frame-font "Liberation Mono-7")
;;(set-frame-font "Andale Mono-7")

;;(set-frame-font "Ubuntu Mono-9")

;;(set-frame-font "Courier 10 Pitch-7")
;;(set-frame-font "FreeMono-7")

;;(set-frame-font "6x12")
;;(set-frame-font "7x13")


(add-to-list 'auto-mode-alist '("\\.tpl$" . html-mode))



;; Key bindings
;; (global-set-key [?\C-x ?\C-g] 'goto-line) ;; Suppose C-g should not perform actions


;;(autoload 'javascript-mode "javascript" nil t)
;;(add-to-list 'auto-mode-alist '("\\.js\\'" . javascript-mode))


(autoload 'js2-mode "js2" nil t)
(add-to-list 'auto-mode-alist '("\\.js$" . js2-mode))


;;stuff for xwindows sytem case
(when window-system
(require 'color-theme)
(color-theme-initialize)
;;(color-theme-charcoal-black)
(color-theme-comidia)
;;(color-theme-clarity)
;;(color-theme-dark-laptop)
;;(color-theme-hober)
;;(color-theme-ld-dark)
;;(color-theme-bharadwaj-slate)
;;(color-theme-deep-blue)
;;(color-theme-dark-blue2)
)





(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(android-mode-sdk-dir "~/android/sdk")
 '(auto-fill-mode t)
 '(column-number-mode t)
 '(js2-auto-indent-p t)
 '(js2-bounce-indent-p t)
 '(js2-cleanup-whitespace nil)
 '(js2-enter-indents-newline t)
 '(js2-highlight-level 3)
 '(js2-indent-on-enter-key t)
 '(js2-mirror-mode nil)
 '(js2-mode-escape-quotes nil)
 '(js2-strict-missing-semi-warning nil)
 '(menu-bar-mode nil)
 '(org-agenda-files (quote ("~/org.org")))
 '(scroll-bar-mode nil)
 '(tab-width 8)
 '(tool-bar-mode nil nil (tool-bar))
 '(tooltip-mode nil nil (tooltip)))


(define-key global-map "\C-ca" 'org-agenda)

;; additional extensions used by Drupal
(add-to-list 'auto-mode-alist '("\\.php[34]?\\'\\|\\.inc\\'\\|\\.module\\'\\|\\.phtml\\'" . php-mode))




;;;;"I always compile my .emacs, saves me about two seconds
;;;;startuptime. But that only helps if the .emacs.elc is newer
;;;;than the .emacs. So compile .emacs if it's not."
(defun autocompile nil
    "compile itself if ~/.emacs"
      (interactive)
        (require 'bytecomp)
	  (if (string= (buffer-file-name) (expand-file-name (concat
							     default-directory ".emacs")))
	            (byte-compile-file (buffer-file-name))))

(add-hook 'after-save-hook 'autocompile)



(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 )



(require 'smooth-scroll)
;; scroll one line at a time (less "jumpy" than defaults)
(setq mouse-wheel-scroll-amount '(1 ((shift) . 1))) ;; one line at a time
(setq mouse-wheel-progressive-speed nil) ;; don't accelerate scrolling
(setq mouse-wheel-follow-mouse 't) ;; scroll window under mouse
(setq scroll-step 1) ;; keyboard scroll one line at a time
(setq scroll-conservatively 10000)


(global-set-key (kbd "M-n") (lambda () (interactive) (scroll-down 2)))
(global-set-key (kbd "M-p") (lambda () (interactive) (scroll-up 2)))

(global-set-key (kbd "C-x i") 'previous-multiframe-window)

(global-set-key (kbd "C-M-b") (lambda () (interactive) (shrink-window-horizontally 2)))
(global-set-key (kbd "C-M-f") (lambda () (interactive) (enlarge-window-horizontally 2)))
(global-set-key (kbd "C-M-p") (lambda () (interactive) (shrink-window 1)))
(global-set-key (kbd "C-M-n") (lambda () (interactive) (enlarge-window 1)))

;;(setq smooth-scroll-mode t)
(smooth-scroll-mode)

(require 'android-mode)




;; show opposite braces / brackets
(show-paren-mode t)
(setq show-paren-style 'expression)
(set-face-background 'show-paren-match-face "#07090B")

;; disable version control (otherwise git hooks slowdown the sshfs)
;;(setq vc-handled-backends ())

;;(set-face-background 'region "#050F15")
(set-face-background 'region "#071319")

