// encoding-profile-modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EncodingProfile, EncodingService } from '../services/encodings.service';


@Component({
  selector: 'app-encoding-profile-modal',
  standalone: true, 
  imports : [ReactiveFormsModule,CommonModule],
  templateUrl: './encodingprofilemodal.component.html',
  styleUrls: ['./encodingprofilemodal.component.css']
})
export class EncodingProfileModalComponent implements OnInit {
  @Output() modalClosed = new EventEmitter<void>();
  @Output() profileCreated = new EventEmitter<EncodingProfile>();

  encodingForm: FormGroup;
  showAdvanced: boolean = false;

  constructor(private fb: FormBuilder,private encodingService: EncodingService) {
    this.encodingForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      resolution: ['', Validators.required],
      customResolution: [''],
      bitrate: ['', Validators.required],
      customBitrate: [''],
      formatType: ['', Validators.required],
      preset: ['medium'],
      codec: ['libx264'],
      crf: [23],
      framerate: ['30'],
      enableHardwareAccel: [false],
      enableDRM: [false],
      generateThumbnails: [true],
      customFFmpegArgs: ['']
    });
  }

  ngOnInit(): void {
    // Set up form value change listeners
    this.encodingForm.get('resolution')?.valueChanges.subscribe(value => {
      const customResolutionControl = this.encodingForm.get('customResolution');
      if (value === 'custom') {
        customResolutionControl?.setValidators([Validators.required]);
      } else {
        customResolutionControl?.clearValidators();
      }
      customResolutionControl?.updateValueAndValidity();
    });

    this.encodingForm.get('bitrate')?.valueChanges.subscribe(value => {
      const customBitrateControl = this.encodingForm.get('customBitrate');
      if (value === 'custom') {
        customBitrateControl?.setValidators([Validators.required]);
      } else {
        customBitrateControl?.clearValidators();
      }
      customBitrateControl?.updateValueAndValidity();
    });
  }

  toggleAdvanced(): void {
    this.showAdvanced = !this.showAdvanced;
  }

  closeModal(): void {
    this.modalClosed.emit();
  }


  private generateFFmpegArgs(): string {
  const formValue = this.encodingForm.value;
  const args: string[] = [];

  // Codec & resolution
  args.push(`-c:v ${formValue.codec}`);
  const resolution = formValue.resolution === 'custom' ? formValue.customResolution : formValue.resolution;
  if (resolution) args.push(`-s ${resolution}`);

  // Bitrate
  const bitrate = formValue.bitrate === 'custom' ? formValue.customBitrate : formValue.bitrate;
  if (bitrate) args.push(`-b:v ${bitrate}`);

  // CRF, preset, framerate
  args.push(`-crf ${formValue.crf}`);
  args.push(`-preset ${formValue.preset}`);
  args.push(`-r ${formValue.framerate}`);

  // GOP settings for consistent segmenting (CMAF requirement)
  const fps = parseFloat(formValue.framerate);
  const gop = Math.round(fps * 4); // 4s segment duration
  args.push(`-g ${gop}`);
  args.push(`-keyint_min ${gop}`);
  args.push(`-sc_threshold 0`);

  // Hardware Acceleration
  if (formValue.enableHardwareAccel) {
    args.push('-hwaccel auto');
  }

  // Audio
  args.push('-c:a aac');
  args.push('-b:a 128k');

  // Format-specific CMAF output
  if (formValue.formatType === 'hls') {
    args.push('-f hls');
    args.push('-hls_time 4');
    args.push('-hls_segment_type fmp4');
    args.push('-hls_playlist_type vod');
  } else if (formValue.formatType === 'dash') {
    args.push('-f dash');
    args.push('-seg_duration 4');
    args.push('-use_template 1 -use_timeline 1');
    args.push('-init_seg_name init-$RepresentationID$.mp4');
    args.push('-media_seg_name chunk-$RepresentationID$-$Number$.m4s');
    args.push('-adaptation_sets "id=0,streams=v id=1,streams=a"');
  }

  

  // Custom args
  if (formValue.customFFmpegArgs?.trim()) {
    args.push(formValue.customFFmpegArgs.trim());
  }

  return args.join(' ');
}



  onSubmit(): void {
  if (this.encodingForm.valid) {
    const formValue = this.encodingForm.value;

    const encodingProfile: EncodingProfile = {
      name: formValue.name,
      resolution: formValue.resolution === 'custom' ? formValue.customResolution : formValue.resolution,
      bitrate: formValue.bitrate === 'custom' ? formValue.customBitrate : formValue.bitrate,
      format_type: formValue.formatType,
      ffmpeg_args: this.generateFFmpegArgs(),
      created_at: new Date().toISOString()
    };

    // Send to backend
    this.encodingService.addEncodingProfile(encodingProfile).subscribe({
      next: (response) => {
        console.log('Encoding profile successfully saved:', response);
        this.profileCreated.emit(response);
        this.closeModal();
      },
      error: (error) => {
        console.error('Failed to save encoding profile:', error);
      }
    });
  } else {
    Object.keys(this.encodingForm.controls).forEach(key => {
      this.encodingForm.get(key)?.markAsTouched();
    });
  }
}


  // Helper method to get form control errors
  getFieldError(fieldName: string): string | null {
    const field = this.encodingForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return null;
  }
}